import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'CTI_TEMP_SECRET_KEY';

// Convert db product to nested structure frontend expects
function mapProductToFrontend(p) {
    if (!p) return null;
    const isOffer = false; 
    const finalPrice = p.price * 1.15 * 1.16;

    return {
        id: p.id,
        titulo: p.title,
        status: p.stock > 0 ? "Activo" : "Agotado",
        sku: p.ingramSku,
        precio_contado: finalPrice,
        precio_final: finalPrice,
        precio_final_descuento: 0,
        stock_total: p.stock,
        imagen1xs: p.imageUrl || null,
        imagen1s: p.imageUrl || null,
        slug: `${p.title.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '-')}-${p.ingramSku}`.toLowerCase(),
        
        marca: { id: 1, name: p.brand || 'Generico', slug: (p.brand || 'generico').toLowerCase() },
        categoria: { id: 1, name: p.category || 'Varios', slug: (p.category || 'varios').toLowerCase() },
        subcategoria: { id: 1, name: 'General', slug: 'general' }
    };
}

export default async function handler(req, res) {
    const db = prisma;
    let userId = null;

    // Intentar verificar token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.user_id;
        } catch (e) {
            // Token inválido, continuar como invitado
        }
    }

    if (req.method === 'GET') {
        if (!userId) {
            return res.status(200).json({ cart_items: [], shipping_cost: 0, total: 0 });
        }

        const cartItems = await db.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        const formattedCart = cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            product: mapProductToFrontend(item.product)
        }));

        return res.status(200).json({
            cart_items: formattedCart,
            shipping_cost: 150,
            total: 0
        });
    }

    if (req.method === 'POST') {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

        if (!userId) {
            // Usuario Invitado Sincronizando
            if (body.cart && Array.isArray(body.cart)) {
                const validatedCart = [];
                for (const item of body.cart) {
                    if (item && item.product && item.product.id) {
                        const product = await db.product.findUnique({
                            where: { id: Number(item.product.id) }
                        });
                        if (product) {
                            const stock = product.stock;
                            const quantity = Math.min(Number(item.quantity) || 1, stock);
                            if (quantity > 0) {
                                validatedCart.push({
                                    ...item,
                                    quantity,
                                    product: mapProductToFrontend(product)
                                });
                            }
                        }
                    }
                }
                return res.status(200).json({
                    cart_items: validatedCart,
                    shipping_cost: 150,
                    total: 0
                });
            }
            return res.status(200).json({ cart_items: [], shipping_cost: 0, total: 0 });
        }

        // Usuario Autenticado Modificando Carrito
        // El frontend puede enviar un single item add/update
        if (body.product_id && body.quantity !== undefined) {
            const productId = Number(body.product_id);
            const product = await db.product.findUnique({
                where: { id: productId }
            });
            const stock = product ? product.stock : 0;

            if (body.quantity <= 0) {
                await db.cart.deleteMany({
                    where: { userId, productId }
                });
            } else {
                let targetQuantity = body.quantity;
                if (!body.update_quantity) {
                    const currentCartItem = await db.cart.findUnique({
                        where: { userId_productId: { userId, productId } }
                    });
                    if (currentCartItem) {
                        targetQuantity = currentCartItem.quantity + body.quantity;
                    }
                }

                // Truncar al stock disponible
                if (targetQuantity > stock) {
                    targetQuantity = stock;
                }

                if (targetQuantity <= 0) {
                    await db.cart.deleteMany({
                        where: { userId, productId }
                    });
                } else {
                    await db.cart.upsert({
                        where: { userId_productId: { userId, productId } },
                        update: { quantity: targetQuantity },
                        create: { userId, productId, quantity: targetQuantity }
                    });
                }
            }
        }

        // Obtener el carrito completo después del upsert
        const updatedCartItems = await db.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        // Filtrar y validar stock de elementos persistidos (por seguridad)
        const formattedCart = [];
        for (const item of updatedCartItems) {
            const stock = item.product ? item.product.stock : 0;
            if (item.quantity > stock) {
                if (stock <= 0) {
                    await db.cart.deleteMany({
                        where: { id: item.id }
                    });
                    continue;
                } else {
                    await db.cart.update({
                        where: { id: item.id },
                        data: { quantity: stock }
                    });
                    item.quantity = stock;
                }
            }
            formattedCart.push({
                id: item.id,
                quantity: item.quantity,
                product: mapProductToFrontend(item.product)
            });
        }

        return res.status(200).json({
            cart_items: formattedCart,
            shipping_cost: 150,
            total: 0
        });
    }

    if (req.method === 'DELETE') {
        if (!userId) return res.status(401).json({ detail: 'No auth' });

        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
        if (body.item_id) {
            // A veces el frontend manda el delete con item_id (que es el proxy product id o cart item id)
            await db.cart.deleteMany({
                where: { userId, productId: Number(body.item_id) }
            });
        }
        
        return res.status(200).json({ status: 'deleted' });
    }

    return res.status(405).json({ detail: 'Method not allowed' });
}
