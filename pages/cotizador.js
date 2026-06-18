import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEnv } from '../context/EnvContext';
import Footer from '../components/Footer/Footer';
import { useAppSelector } from '../lib/hooks';
import CurrencyFormat from '../hooks/CurrencyFormat';
import useCart from '../hooks/useCart';

const DELIVERY_DAYS = '3 a 5 días hábiles';

export default function Cotizador() {
  const router = useRouter();
  const { cart } = useCart();
  const { storeName, phone, contactEmail, address, logoUrl, titlePostDescription } = useEnv();
  const mobileView = useAppSelector((s) => s.mobileSlide.mobileView);

  // State
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [folio, setFolio] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Folio from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cti_quote_folio');
    setFolio(saved ? parseInt(saved) + 1 : 1);
  }, []);

  // Pre-populate items from cart if redirected from cart
  useEffect(() => {
    if (router.isReady && router.query.fromCart === 'true' && cart && cart.length > 0) {
      const cartItems = cart.map((item) => ({
        id: item.id || Date.now() + Math.random(),
        sku: item.product.sku || item.product.modelo || '',
        title: item.product.titulo || item.product.title || '',
        image: item.product.imagen1s || item.product.imageUrl || (item.product.sku ? `/api/images/${item.product.sku}` : '/images/not-available.png'),
        price: item.product.precio_contado || item.product.precio_final || 0,
        quantity: item.quantity || 1,
      }));
      setItems(cartItems);

      // Clean the query parameter shallowly
      const { fromCart, ...restQuery } = router.query;
      router.replace(
        {
          pathname: router.pathname,
          query: restQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router.isReady, router.query.fromCart, cart]);

  // Click outside to close suggestions
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search products
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/proxy/suggestions?q=${encodeURIComponent(value)}`);
        const data = await resp.json();
        setSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch (err) { console.error(err); }
    }, 300);
  }, []);

  // Add product
  const addProduct = (product) => {
    const existing = items.find((i) => i.sku === product.sku);
    if (existing) {
      setItems(items.map((i) => i.sku === product.sku ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, {
        id: Date.now(),
        sku: product.sku || product.modelo || '',
        title: product.titulo || product.title || '',
        image: product.imagen1s || product.image || product.imageUrl || '/images/not-available.png',
        price: product.precio_contado || product.precio_final || 0,
        quantity: 1,
      }]);
    }
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Remove product
  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  // Update quantity
  const updateQty = (id, qty) => {
    const val = Math.max(1, parseInt(qty) || 1);
    setItems(items.map((i) => i.id === id ? { ...i, quantity: val } : i));
  };

  // Update price
  const updatePrice = (id, price) => {
    const val = Math.max(0, parseFloat(price) || 0);
    setItems(items.map((i) => i.id === id ? { ...i, price: val } : i));
  };

  // Totals
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  // Generate PDF
  const generatePDF = async () => {
    if (items.length === 0) { alert('Agrega al menos un producto'); return; }
    setIsGenerating(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      const { applyPlugin } = await import('jspdf-autotable');
      applyPlugin(jsPDF);

      const doc = new jsPDF('p', 'mm', 'letter');
      const pageW = doc.internal.pageSize.getWidth();
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      // Header
      doc.setFillColor(35, 73, 241);
      doc.rect(0, 0, pageW, 3, 'F');

      // Logo text
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(35, 73, 241);
      doc.text(storeName || 'CTI Systems', 15, 20);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(address || '', 15, 26);
      doc.text(`Tel: ${phone || ''} | ${contactEmail || ''}`, 15, 31);

      // Folio
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`Folio`, pageW - 45, 14);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(35, 73, 241);
      doc.text(`${folio}`, pageW - 45, 21);

      // Date
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      doc.text(`Fecha: ${dateStr}`, pageW - 75, 28);

      // Client
      doc.setDrawColor(200);
      doc.line(15, 36, pageW - 15, 36);
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Atn: ${clientName || 'Cliente'}`, 15, 42);

      // Pre-load images as base64
      const loadImage = (url) => {
        return new Promise((resolve) => {
          if (!url || url.includes('not-available')) { resolve(null); return; }
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            } catch { resolve(null); }
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };

      const imageDataMap = {};
      await Promise.all(items.map(async (item, idx) => {
        imageDataMap[idx] = await loadImage(item.image);
      }));

      // Table data (with empty image placeholder column)
      const tableData = items.map((item, idx) => [
        idx + 1,
        item.quantity,
        item.sku,
        '',  // image placeholder
        item.title.substring(0, 60),
        `$${CurrencyFormat(item.price)}`,
        DELIVERY_DAYS,
        `$${CurrencyFormat(item.price * item.quantity)}`,
      ]);

      doc.autoTable({
        startY: 48,
        head: [['#', 'Cant.', 'Clave', 'Img', 'Descripción', 'Precio', 'Entrega', 'Subtotal']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [35, 73, 241],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: { fontSize: 7, textColor: [50, 50, 50], minCellHeight: 16 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 8 },
          1: { halign: 'center', cellWidth: 12 },
          2: { cellWidth: 22 },
          3: { cellWidth: 16 },          // image column
          4: { cellWidth: 'auto' },
          5: { halign: 'right', cellWidth: 20 },
          6: { halign: 'center', cellWidth: 24 },
          7: { halign: 'right', cellWidth: 22 },
        },
        alternateRowStyles: { fillColor: [248, 249, 255] },
        margin: { left: 15, right: 15 },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 3) {
            const imgData = imageDataMap[data.row.index];
            if (imgData) {
              const dim = 12;
              const x = data.cell.x + (data.cell.width - dim) / 2;
              const y = data.cell.y + (data.cell.height - dim) / 2;
              try { doc.addImage(imgData, 'JPEG', x, y, dim, dim); } catch {}
            }
          }
        },
      });

      let finalY = (doc.lastAutoTable?.finalY || 120) + 5;

      // Notes
      if (notes) {
        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.text('Notas:', 15, finalY);
        const splitNotes = doc.splitTextToSize(notes, pageW - 80);
        doc.text(splitNotes, 15, finalY + 5);
        finalY += 5 + splitNotes.length * 4;
      }

      // Totals box
      const totalsX = pageW - 80;
      finalY += 5;
      doc.setFillColor(248, 249, 255);
      doc.roundedRect(totalsX, finalY, 65, 32, 2, 2, 'F');

      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text('Subtotal MX:', totalsX + 5, finalY + 8);
      doc.text(`$${CurrencyFormat(subtotal)}`, totalsX + 58, finalY + 8, { align: 'right' });

      doc.text('IVA (16%):', totalsX + 5, finalY + 16);
      doc.text(`$${CurrencyFormat(iva)}`, totalsX + 58, finalY + 16, { align: 'right' });

      doc.setDrawColor(35, 73, 241);
      doc.line(totalsX + 5, finalY + 20, totalsX + 58, finalY + 20);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(35, 73, 241);
      doc.text('Total MX:', totalsX + 5, finalY + 28);
      doc.text(`$${CurrencyFormat(total)}`, totalsX + 58, finalY + 28, { align: 'right' });

      // Footer - conditions
      const footerY = doc.internal.pageSize.getHeight() - 35;
      doc.setDrawColor(200);
      doc.line(15, footerY, pageW - 15, footerY);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80);
      doc.text('Condiciones Comerciales:', 15, footerY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      const conditions = [
        'Precios expresados en Moneda Nacional (MXN) antes de IVA',
        'Precios sujetos a cambio sin previo aviso',
        'La presente cotización tiene una vigencia de 10 días naturales',
        'Se requiere orden de compra',
        'El presente documento no es un documento fiscal',
      ];
      conditions.forEach((c, i) => {
        doc.text(`• ${c}`, 15, footerY + 10 + i * 3.5);
      });

      // Contact footer
      doc.setFontSize(8);
      doc.setTextColor(35, 73, 241);
      doc.text(`${contactEmail || ''} | (${phone || ''})`, pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

      // Save
      doc.save(`CTI_Cotizacion_${folio}.pdf`);
      localStorage.setItem('cti_quote_folio', folio.toString());
      setFolio(folio + 1);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="cotizador-page">
      <Head>
        <title>{`Cotizador | ${storeName}: ${titlePostDescription}`}</title>
      </Head>

      <div className="cotizador">
        {/* Header */}
        <div className="cotizador__header">
          <div className="cotizador__header-left">
            <h1>Cotizador</h1>
            <p className="cotizador__subtitle">Genera cotizaciones profesionales al instante</p>
          </div>
          <div className="cotizador__header-right">
            <span className="folio-label">Folio</span>
            <span className="folio-number">{folio}</span>
          </div>
        </div>

        {/* Client info */}
        <div className="cotizador__client">
          <label>Cliente / Empresa:</label>
          <input
            type="text"
            placeholder="Nombre del cliente o empresa..."
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>

        {/* Product search */}
        <div className="cotizador__search" ref={searchRef}>
          <label>Agregar productos:</label>
          <input
            type="text"
            placeholder="Busca por nombre, SKU o marca..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-dropdown">
              {suggestions.map((p, i) => (
                <div key={i} className="search-item" onClick={() => addProduct(p)}>
                  <img
                    src={p.imagen1s || p.image || '/images/not-available.png'}
                    alt=""
                    width={40}
                    height={40}
                    onError={(e) => { e.target.src = '/images/not-available.png'; }}
                  />
                  <div className="search-item__info">
                    <span className="search-item__title">{(p.titulo || p.title || '').substring(0, 60)}</span>
                    <span className="search-item__sku">SKU: {p.sku || p.modelo}</span>
                  </div>
                  <span className="search-item__price">${CurrencyFormat(p.precio_contado || p.precio_final || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products table */}
        {items.length > 0 && (
          <div className="cotizador__table-wrap">
            <table className="cotizador__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cant.</th>
                  <th>Clave</th>
                  <th>Descripción</th>
                  <th>Precio Unit.</th>
                  <th>Entrega</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="center">{idx + 1}</td>
                    <td className="center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQty(item.id, e.target.value)}
                        className="qty-input"
                      />
                    </td>
                    <td className="sku-cell">{item.sku}</td>
                    <td className="desc-cell">
                      <div className="desc-row">
                        <img
                          src={item.image}
                          alt=""
                          width={45}
                          height={45}
                          onError={(e) => { e.target.src = '/images/not-available.png'; }}
                        />
                        <span>{item.title.substring(0, 80)}</span>
                      </div>
                    </td>
                    <td className="price-cell">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updatePrice(item.id, e.target.value)}
                        className="price-input"
                      />
                    </td>
                    <td className="center delivery">{DELIVERY_DAYS}</td>
                    <td className="subtotal-cell">${CurrencyFormat(item.price * item.quantity)}</td>
                    <td className="center">
                      <button className="btn-remove" onClick={() => removeItem(item.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length === 0 && (
          <div className="cotizador__empty">
            <p>🔍 Busca y agrega productos para comenzar tu cotización</p>
          </div>
        )}

        {/* Notes */}
        {items.length > 0 && (
          <div className="cotizador__notes">
            <label>Notas adicionales (opcional):</label>
            <textarea
              placeholder="Escribe observaciones o notas especiales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Totals + Actions */}
        {items.length > 0 && (
          <div className="cotizador__footer">
            <div className="cotizador__totals">
              <div className="total-row"><span>Subtotal:</span><span>${CurrencyFormat(subtotal)}</span></div>
              <div className="total-row"><span>IVA (16%):</span><span>${CurrencyFormat(iva)}</span></div>
              <div className="total-row total-row--final"><span>Total MX:</span><span>${CurrencyFormat(total)}</span></div>
            </div>
            <div className="cotizador__actions">
              <button className="btn-pdf" onClick={generatePDF} disabled={isGenerating}>
                {isGenerating ? 'Generando...' : '📄 Generar PDF'}
              </button>
              <button className="btn-clear" onClick={() => { setItems([]); setNotes(''); setClientName(''); }}>
                🗑️ Limpiar todo
              </button>
            </div>
          </div>
        )}
      </div>

      {!mobileView && <Footer />}

      <style jsx>{`
        .cotizador-page { width: 100%; min-height: 100vh; background: #f5f7fa; }
        .cotizador {
          max-width: 1100px; margin: 0 auto; padding: 30px 20px;
        }
        .cotizador__header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid var(--primary-color, #2349f1);
        }
        .cotizador__header h1 { font-size: 28px; margin: 0; color: #1a1a2e; }
        .cotizador__subtitle { color: #666; margin: 5px 0 0; font-size: 14px; }
        .cotizador__header-right { text-align: center; }
        .folio-label { display: block; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
        .folio-number {
          display: block; font-size: 28px; font-weight: 700;
          color: var(--primary-color, #2349f1); line-height: 1;
        }
        .cotizador__client, .cotizador__search, .cotizador__notes {
          margin-bottom: 20px;
        }
        .cotizador__client label, .cotizador__search label, .cotizador__notes label {
          display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 6px;
        }
        .cotizador__client input, .cotizador__search input {
          width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px;
          font-size: 14px; transition: border-color 0.2s; background: #fff;
        }
        .cotizador__client input:focus, .cotizador__search input:focus {
          outline: none; border-color: var(--primary-color, #2349f1); box-shadow: 0 0 0 3px rgba(35,73,241,0.1);
        }
        .cotizador__search { position: relative; }
        .search-dropdown {
          position: absolute; top: 100%; left: 0; right: 0; background: #fff;
          border: 1px solid #ddd; border-radius: 0 0 8px 8px; max-height: 320px;
          overflow-y: auto; z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .search-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 16px;
          cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #f0f0f0;
        }
        .search-item:hover { background: #f0f4ff; }
        .search-item img { border-radius: 4px; object-fit: contain; background: #f9f9f9; flex-shrink: 0; }
        .search-item__info { flex: 1; min-width: 0; }
        .search-item__title { display: block; font-size: 13px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .search-item__sku { font-size: 11px; color: #888; }
        .search-item__price { font-weight: 700; color: var(--primary-color, #2349f1); font-size: 14px; white-space: nowrap; }
        .cotizador__table-wrap { overflow-x: auto; margin-bottom: 20px; background: #fff; border-radius: 8px; border: 1px solid #e0e0e0; }
        .cotizador__table { width: 100%; border-collapse: collapse; }
        .cotizador__table thead th {
          background: var(--primary-color, #2349f1); color: #fff; padding: 10px 12px;
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;
        }
        .cotizador__table tbody td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; vertical-align: middle; }
        .cotizador__table tbody tr:hover { background: #f8f9ff; }
        .center { text-align: center; }
        .sku-cell { font-family: monospace; font-size: 11px; color: #555; white-space: nowrap; }
        .desc-cell { max-width: 300px; }
        .desc-row { display: flex; align-items: center; gap: 10px; }
        .desc-row img { border-radius: 4px; object-fit: contain; background: #f9f9f9; flex-shrink: 0; }
        .desc-row span { font-size: 12px; line-height: 1.3; }
        .price-cell, .subtotal-cell { text-align: right; white-space: nowrap; font-weight: 600; }
        .delivery { font-size: 11px; color: #666; white-space: nowrap; }
        .qty-input { width: 50px; text-align: center; border: 1px solid #ddd; border-radius: 4px; padding: 4px; font-size: 13px; }
        .price-input { width: 90px; text-align: right; border: 1px solid #ddd; border-radius: 4px; padding: 4px 6px; font-size: 13px; }
        .btn-remove {
          background: none; border: none; color: #dc3545; font-size: 16px; cursor: pointer;
          width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; transition: background 0.2s;
        }
        .btn-remove:hover { background: #fde8ea; }
        .cotizador__empty {
          text-align: center; padding: 60px 20px; background: #fff; border-radius: 8px;
          border: 2px dashed #ddd; color: #888; font-size: 16px; margin-bottom: 20px;
        }
        .cotizador__notes textarea {
          width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;
          font-size: 13px; resize: vertical; font-family: inherit;
        }
        .cotizador__notes textarea:focus { outline: none; border-color: var(--primary-color, #2349f1); }
        .cotizador__footer {
          display: flex; justify-content: space-between; align-items: flex-end; gap: 30px;
          flex-wrap: wrap;
        }
        .cotizador__totals {
          background: #fff; border-radius: 8px; padding: 20px 24px;
          border: 1px solid #e0e0e0; min-width: 280px;
        }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #555; }
        .total-row--final {
          border-top: 2px solid var(--primary-color, #2349f1); margin-top: 8px; padding-top: 12px;
          font-size: 20px; font-weight: 700; color: var(--primary-color, #2349f1);
        }
        .cotizador__actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-pdf {
          padding: 14px 28px; background: var(--primary-color, #2349f1); color: #fff;
          border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(35,73,241,0.3);
        }
        .btn-pdf:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(35,73,241,0.4); }
        .btn-pdf:disabled { opacity: 0.6; cursor: wait; transform: none; }
        .btn-clear {
          padding: 14px 28px; background: #fff; color: #dc3545; border: 1px solid #dc3545;
          border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-clear:hover { background: #fde8ea; }
        @media (max-width: 768px) {
          .cotizador { padding: 15px 10px; }
          .cotizador__header { flex-direction: column; gap: 10px; }
          .cotizador__header h1 { font-size: 22px; }
          .cotizador__footer { flex-direction: column; align-items: stretch; }
          .cotizador__totals { min-width: unset; }
          .cotizador__actions { justify-content: stretch; }
          .btn-pdf, .btn-clear { width: 100%; text-align: center; }
          .desc-row span { font-size: 11px; max-width: 150px; }
        }
      `}</style>
    </div>
  );
}
