import { useState } from 'react';
import { getProductList, getProductDetail } from '../lib/apiClient';

export default function TestAPIPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testFullList = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await getProductList();
            setResult({
                test: 'Lista Completa (SKU vacío)',
                success: data.status === 200,
                data: data
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testSpecificProduct = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await getProductDetail('QWM581N2');
            setResult({
                test: 'Producto Específico (QWM581N2)',
                success: data.status === 200,
                data: data
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'monospace' }}>
            <h1>🧪 Test de API PCH</h1>

            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={testFullList}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        background: '#0070f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Probar Lista Completa
                </button>

                <button
                    onClick={testSpecificProduct}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Probar Producto Específico
                </button>
            </div>

            {loading && <p style={{ marginTop: '20px' }}>⏳ Cargando...</p>}

            {error && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '5px'
                }}>
                    <strong>❌ Error:</strong> {error}
                </div>
            )}

            {result && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Resultado: {result.test}</h2>
                    <div style={{
                        padding: '15px',
                        background: result.success ? '#efe' : '#fee',
                        border: `1px solid ${result.success ? '#cfc' : '#fcc'}`,
                        borderRadius: '5px'
                    }}>
                        <strong>Status:</strong> {result.success ? '✅ Éxito' : '❌ Error'}
                    </div>

                    <details style={{ marginTop: '15px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            📦 Ver JSON Completo
                        </summary>
                        <pre style={{
                            marginTop: '10px',
                            padding: '15px',
                            background: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            overflow: 'auto',
                            fontSize: '12px'
                        }}>
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                    </details>

                    {result.data.data?.productos && (
                        <div style={{ marginTop: '15px' }}>
                            <h3>📊 Productos encontrados: {result.data.data.productos.length}</h3>
                            {result.data.data.productos.slice(0, 3).map((producto, idx) => (
                                <div key={idx} style={{
                                    padding: '10px',
                                    marginTop: '10px',
                                    background: '#f9f9f9',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px'
                                }}>
                                    <strong>SKU:</strong> {producto.sku}<br />
                                    <strong>Descripción:</strong> {producto.descripcion}<br />
                                    <strong>Stock:</strong> {producto.inventario?.[0]?.cantidad || 0}<br />
                                    <strong>Precio:</strong> ${producto.peso_bruto} {producto.moneda}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
