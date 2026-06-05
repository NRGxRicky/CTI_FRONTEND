const { jsPDF } = require("jspdf");
const { applyPlugin } = require("jspdf-autotable");
const fs = require("fs");
const path = require("path");

// Aplicar el plugin de autotable
applyPlugin(jsPDF);

// Crear instancia del documento en tamaño carta, unidad milímetros
const doc = new jsPDF('p', 'mm', 'letter');
const pageW = doc.internal.pageSize.getWidth(); // ~215.9 mm
const pageH = doc.internal.pageSize.getHeight(); // ~279.4 mm
const margin = 15;
const usableW = pageW - margin * 2; // ~185.9 mm

// Paleta de colores CTI Systems
const COLOR_PRIMARY = [35, 73, 241];    // Azul CTI #2349f1
const COLOR_SECONDARY = [20, 40, 150];  // Azul marino para títulos
const COLOR_TEXT = [60, 60, 60];        // Gris oscuro para cuerpo
const COLOR_LIGHT_BG = [248, 249, 255]; // Fondo azul claro/grisáceo
const COLOR_BORDER = [220, 225, 255];   // Líneas divisorias
const COLOR_MUTED = [120, 120, 120];     // Gris claro para pie de página

// Helper para dibujar la decoración de página (encabezado superior y pie de página)
function addPageDecorations(pdfDoc, pageNum, totalPages) {
  // Barra superior de acento azul
  pdfDoc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  pdfDoc.rect(0, 0, pageW, 5, 'F');

  // Separador de pie de página
  pdfDoc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
  pdfDoc.setLineWidth(0.3);
  pdfDoc.line(margin, pageH - 15, pageW - margin, pageH - 15);

  // Texto del pie de página
  pdfDoc.setFont('helvetica', 'normal');
  pdfDoc.setFontSize(7.5);
  pdfDoc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
  pdfDoc.text("CTI SYSTEMS  |  www.ctisystems.mx", margin, pageH - 10);
  pdfDoc.text(`Página ${pageNum} de ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' });
}

// Helper para dibujar títulos de secciones con subrayado de acento
function drawSectionHeader(pdfDoc, title, y) {
  pdfDoc.setFont('helvetica', 'bold');
  pdfDoc.setFontSize(13);
  pdfDoc.setTextColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
  pdfDoc.text(title, margin, y);

  pdfDoc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
  pdfDoc.setLineWidth(0.4);
  pdfDoc.line(margin, y + 2.5, pageW - margin, y + 2.5);

  return y + 8;
}

// Helper para dibujar subtítulos de secciones
function drawSubHeader(pdfDoc, title, y) {
  pdfDoc.setFont('helvetica', 'bold');
  pdfDoc.setFontSize(10);
  pdfDoc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  pdfDoc.text(title, margin, y);
  return y + 5;
}

// Helper para escribir párrafos de texto con auto-ajuste de línea
function drawTextParagraph(pdfDoc, text, y, fontSize = 9.5, fontStyle = 'normal', color = COLOR_TEXT, lineSpacing = 4.5) {
  pdfDoc.setFontSize(fontSize);
  pdfDoc.setFont('helvetica', fontStyle);
  pdfDoc.setTextColor(color[0], color[1], color[2]);
  
  const lines = pdfDoc.splitTextToSize(text, usableW);
  for (let i = 0; i < lines.length; i++) {
    pdfDoc.text(lines[i], margin, y + i * lineSpacing);
  }
  return y + (lines.length * lineSpacing) + 2; // Añade espacio post-párrafo
}

// Helper para escribir una lista de viñetas
function drawBulletList(pdfDoc, items, y, fontSize = 9, color = COLOR_TEXT, lineSpacing = 4.2, itemSpacing = 1.8) {
  let currentY = y;
  pdfDoc.setFontSize(fontSize);
  pdfDoc.setTextColor(color[0], color[1], color[2]);

  items.forEach(item => {
    // Dibujar viñeta
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    pdfDoc.text('•', margin + 2, currentY);

    // Dibujar texto
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setTextColor(color[0], color[1], color[2]);
    
    // Separamos el texto por si tiene partes en negrita (formato simple: "Negrita: Texto normal")
    let titlePart = "";
    let descPart = item;
    if (item.includes(":** ")) {
      const idx = item.indexOf(":** ");
      titlePart = item.substring(0, idx + 3).replace(/\*\*/g, "");
      descPart = item.substring(idx + 4);
    } else if (item.startsWith("**") && item.includes("** ")) {
      const parts = item.split("**");
      if (parts.length >= 3) {
        titlePart = parts[1];
        descPart = parts.slice(2).join("**").trim();
      }
    }

    if (titlePart) {
      // Dibujar título en negrita
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text(titlePart + " ", margin + 6, currentY);
      const titleW = pdfDoc.getTextWidth(titlePart + " ");
      
      pdfDoc.setFont('helvetica', 'normal');
      const lines = pdfDoc.splitTextToSize(descPart, usableW - 6 - titleW);
      
      // Dibujar la primera línea al lado del título
      pdfDoc.text(lines[0], margin + 6 + titleW, currentY);
      currentY += lineSpacing;
      
      // Dibujar el resto de las líneas indentadas
      for (let i = 1; i < lines.length; i++) {
        pdfDoc.text(lines[i], margin + 6, currentY);
        currentY += lineSpacing;
      }
    } else {
      const lines = pdfDoc.splitTextToSize(item, usableW - 6);
      for (let i = 0; i < lines.length; i++) {
        pdfDoc.text(lines[i], margin + 6, currentY + i * lineSpacing);
      }
      currentY += lines.length * lineSpacing;
    }
    
    currentY += itemSpacing;
  });
  return currentY;
}

// Helper para dibujar cajas de llamada (callouts)
function drawCalloutBox(pdfDoc, title, text, y, colorHex = COLOR_PRIMARY) {
  const padding = 5;
  const lines = pdfDoc.splitTextToSize(text, usableW - padding * 2 - 4); // Ajustado por ancho de borde y padding
  const boxHeight = lines.length * 4.5 + 13; // 13mm para cabecera y espacio
  
  // Fondo de la caja
  pdfDoc.setFillColor(COLOR_LIGHT_BG[0], COLOR_LIGHT_BG[1], COLOR_LIGHT_BG[2]);
  pdfDoc.rect(margin, y, usableW, boxHeight, 'F');
  
  // Borde lateral izquierdo grueso
  pdfDoc.setFillColor(colorHex[0], colorHex[1], colorHex[2]);
  pdfDoc.rect(margin, y, 3, boxHeight, 'F');
  
  // Título
  pdfDoc.setFont('helvetica', 'bold');
  pdfDoc.setFontSize(9);
  pdfDoc.setTextColor(colorHex[0], colorHex[1], colorHex[2]);
  pdfDoc.text(title.toUpperCase(), margin + 6, y + 6);
  
  // Texto descriptivo
  pdfDoc.setFont('helvetica', 'normal');
  pdfDoc.setFontSize(8.5);
  pdfDoc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
  for (let i = 0; i < lines.length; i++) {
    pdfDoc.text(lines[i], margin + 6, y + 11.5 + (i * 4.2));
  }
  
  return y + boxHeight + 4;
}

// ==========================================
// PÁGINA 1
// ==========================================

// Encabezado principal de la portada / primera página
doc.setFontSize(26);
doc.setFont('helvetica', 'bold');
doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
doc.text("CTI Systems", margin, 22);

doc.setFontSize(10.5);
doc.setFont('helvetica', 'normal');
doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
doc.text("Soluciones tecnológicas a tu alcance", margin, 27);

// Datos del portal en el lado derecho superior
doc.setFontSize(9.5);
doc.setFont('helvetica', 'bold');
doc.setTextColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
doc.text("www.ctisystems.mx", pageW - margin, 18, { align: 'right' });

doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
doc.text("RFC: CSY150325RH9", pageW - margin, 23, { align: 'right' });
doc.text("Soporte: contacto@ctisystems.mx", pageW - margin, 27, { align: 'right' });

// Línea divisoria principal
doc.setDrawColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
doc.setLineWidth(0.8);
doc.line(margin, 31, pageW - margin, 31);

let currentY = 40;

// Sección 1: Introducción
currentY = drawSectionHeader(doc, "1. Introducción al Sistema de Comercio Electrónico", currentY);
currentY = drawTextParagraph(doc, 
  "Estimado cliente, esta guía interactiva tiene como objetivo detallar el funcionamiento de nuestro portal web, facilitándole la comprensión de las políticas de despacho, la logística de envíos y las pasarelas de pago que tenemos a su disposición.", 
  currentY
);
currentY = drawTextParagraph(doc, 
  "En CTI Systems operamos con un sistema automatizado que enlaza directamente con los almacenes de los fabricantes y mayoristas de tecnología más importantes a nivel global (incluyendo el catálogo completo de Ingram Micro), además de contar con inventario local. Esto garantiza un catálogo siempre actualizado con más de miles de productos disponibles en tiempo real.", 
  currentY
);

currentY += 4;

// Sección 2: El Proceso de Compra (Checkout)
currentY = drawSectionHeader(doc, "2. Flujo del Checkout Paso a Paso", currentY);
currentY = drawTextParagraph(doc, 
  "El proceso de compra en nuestro sitio web ha sido diseñado para ser seguro, intuitivo y transparente. A continuación se desglosan las fases esenciales por las que transita su pedido:", 
  currentY
);

const checkoutSteps = [
  "**Carrito de Compras:** En esta pantalla se concentran los artículos de su interés. El sistema calcula y consolida los pesos de cada artículo de manera automática para preparar la estimación logística.",
  "**Datos de Envío:** Deberá ingresar el domicilio completo de entrega. El sistema valida el código postal e identifica las paqueterías autorizadas para su localidad.",
  "**Información de Facturación (SAT):** Si requiere un comprobante fiscal, puede activar la casilla en este paso e ingresar su RFC, Razón Social, Régimen Fiscal, Uso de CFDI y Código Postal del domicilio fiscal. Nuestro facturador generará el documento CFDI 4.0 automáticamente una vez que el pago sea aprobado.",
  "**Selección del Método de Pago:** Elija entre nuestras pasarelas en línea de alta seguridad (tarjetas de crédito, débito, MSI, financiamientos quincenales) o pagos tradicionales vía transferencia electrónica SPEI.",
  "**Confirmación de Compra:** Revise los montos finales, impuestos correspondientes (IVA) e importes logísticos antes de hacer clic en 'Finalizar Compra'."
];

currentY = drawBulletList(doc, checkoutSteps, currentY);

// Agregar decoraciones de página (primera pasada de pie de página)
addPageDecorations(doc, 1, 3);


// ==========================================
// PÁGINA 2
// ==========================================
doc.addPage();
currentY = 16;

currentY = drawSectionHeader(doc, "3. Funcionamiento y Políticas de Envío", currentY);

currentY = drawSubHeader(doc, "Plazos de Entrega Estándar", currentY);
currentY = drawTextParagraph(doc, 
  "Nuestros pedidos se envían bajo la modalidad estándar terrestre a cualquier rincón de la República Mexicana. El plazo de entrega es de 3 a 5 días hábiles posteriores a la validación de su pago. Los transportistas autorizados incluyen paqueterías de renombre internacional como FedEx, DHL y Estafeta, asegurando la integridad del producto durante el trayecto.", 
  currentY
);

currentY = drawSubHeader(doc, "Logística Multialmacén (Split Shipping)", currentY);
currentY = drawTextParagraph(doc, 
  "Para ofrecer un surtido robusto, CTI Systems opera con un modelo logístico distribuido. Sus artículos pueden encontrarse físicamente en nuestro almacén central o en las bodegas periféricas de mayoristas tecnológicos nacionales (como los CEDIS de Ingram Micro).", 
  currentY
);

currentY = drawCalloutBox(doc, 
  "Envíos Parciales por Bodega Origen (Split Shipping)", 
  "Si los productos añadidos a su carrito pertenecen a almacenes de origen distintos, su orden se procesará en despachos independientes. Cada bodega despachará sus artículos de forma directa. Como resultado, usted recibirá múltiples paquetes y números de guía de rastreo correspondientes a cada envío. Esto NO incrementa el tiempo de entrega y optimiza los costos individuales de transportación.",
  currentY
);

currentY = drawSubHeader(doc, "Cálculo del Importe de Envío", currentY);
currentY = drawTextParagraph(doc, 
  "El costo de envío no es plano; se calcula de manera transparente según el peso físico/volumétrico por cada almacén origen bajo la siguiente regla corporativa:", 
  currentY
);

const shippingRules = [
  "**Agrupación:** El carrito clasifica los productos de acuerdo con su bodega de despacho.",
  "**Tarifa Base Escalonada (0 a 10 kg):** Si el peso acumulado de los artículos de un mismo almacén está en este rango, se aplica una tarifa fija incremental (ver tabla adjunta). El costo de partida es de $150.00 MXN.",
  "**Costo por Kilogramo Extra (Más de 10 kg):** Si el paquete de un almacén excede los 10 kg de peso, se cobra la tarifa máxima del escalón ($198.00 MXN) más $6.00 MXN por cada kilogramo excedente (redondeado hacia arriba)."
];
currentY = drawBulletList(doc, shippingRules, currentY);

// Tabla de tarifas en columna
currentY += 2;
doc.autoTable({
  startY: currentY,
  head: [['Peso Acumulado (kg)', 'Tarifa Terrestre', 'Peso Acumulado (kg)', 'Tarifa Terrestre']],
  body: [
    ['Hasta 1.0 kg', '$150.00 MXN', 'De 5.1 a 6.0 kg', '$175.00 MXN'],
    ['De 1.1 a 2.0 kg', '$154.00 MXN', 'De 6.1 a 7.0 kg', '$181.00 MXN'],
    ['De 2.1 a 3.0 kg', '$159.00 MXN', 'De 7.1 a 8.0 kg', '$186.00 MXN'],
    ['De 3.1 a 4.0 kg', '$164.00 MXN', 'De 8.1 a 9.0 kg', '$192.00 MXN'],
    ['De 4.1 a 5.0 kg', '$170.00 MXN', 'De 9.1 a 10.0 kg', '$198.00 MXN'],
  ],
  theme: 'grid',
  headStyles: { 
    fillColor: [35, 73, 241], 
    textColor: 255, 
    fontSize: 7.5, 
    fontStyle: 'bold', 
    halign: 'center',
    valign: 'middle'
  },
  bodyStyles: { 
    fontSize: 7.5, 
    textColor: [60, 60, 60], 
    halign: 'center',
    valign: 'middle'
  },
  margin: { left: margin, right: margin },
  styles: { cellPadding: 1.5 }
});

currentY = doc.lastAutoTable.finalY + 5;

currentY = drawTextParagraph(doc, 
  "*Fórmula matemática para peso > 10 kg:  Costo Envío = $198.00 MXN + ( Peso Redondeado - 10 ) x $6.00 MXN.", 
  currentY,
  8,
  'italic',
  COLOR_MUTED
);

// Decoraciones de la segunda página
addPageDecorations(doc, 2, 3);


// ==========================================
// PÁGINA 3
// ==========================================
doc.addPage();
currentY = 16;

currentY = drawSectionHeader(doc, "4. Pasarelas y Métodos de Pago", currentY);
currentY = drawTextParagraph(doc, 
  "Con la finalidad de adaptarnos a sus necesidades financieras y garantizar la máxima seguridad en sus transacciones, nuestro sistema cuenta con las siguientes formas de pago:", 
  currentY
);

const paymentGateways = [
  "**PayPal:** Acceso seguro a tarjetas de crédito y débito. Habilita opciones de financiamiento de **hasta 3 Meses Sin Intereses (MSI)** con tarjetas de bancos participantes.",
  "**Mercado Pago:** Liquidación inmediata mediante tarjetas Visa, Mastercard o American Express, saldo digital de Mercado Pago, o a plazos diferidos utilizando su cuenta de **Mercado Crédito** (hasta 12 mensualidades).",
  "**Global Payments:** Terminal de procesamiento bancario directo de alta velocidad. Admite tarjetas de crédito y débito Visa, Mastercard y Carnet en una sola exhibición bajo encriptación SSL.",
  "**Kueski Pay:** Financiamiento 100% en línea y sin tarjetas. Le permite diferir sus compras en hasta **12 quincenas** con preaprobación inmediata en la plataforma del aliado.",
  "**Aplazo:** Divida su compra en **5 pagos quincenales** iguales. El primer pago se realiza al instante y los 4 restantes se debitan quincenalmente de su tarjeta.",
  "**Depósito Bancario / Transferencia SPEI:** Para pagos de contado. El sistema le brindará la CLABE interbancaria de CTI Systems y el número de cuenta al seleccionar este método de pago al final del Checkout."
];

currentY = drawBulletList(doc, paymentGateways, currentY);

currentY = drawCalloutBox(doc, 
  "Procesamiento de Pago Manual (SPEI / Depósito)", 
  "Al pagar vía SPEI o depósito, su orden se guardará con estatus 'PENDIENTE' (PENDING). Para procesar su envío de inmediato, es obligatorio enviar el comprobante de transferencia al correo contacto@ctisystems.mx o vía WhatsApp al 222 239 9000 detallando su Folio de Compra. La validación se completa en menos de 24 horas hábiles.",
  currentY
);

// Sección 5: Estatus de los Pedidos
currentY = drawSectionHeader(doc, "5. Ciclo de Estatus del Pedido", currentY);
currentY = drawTextParagraph(doc, 
  "Usted podrá consultar el estado en tiempo real de su orden en su panel de cliente. Los estados oficiales son:", 
  currentY
);

const orderStatuses = [
  "**Pendiente (PENDING):** Orden registrada a la espera de confirmación de fondos (transferencia o pasarela pendiente).",
  "**Pagado (PAID):** Pago verificado con éxito. El pedido ha sido liberado para su preparación.",
  "**Sincronizado (INGRAM_SYNCED):** Los artículos se han reservado y el pedido se ha enlazado de forma automatizada con los sistemas de almacén (Ingram Micro o local) para su empaque.",
  "**Enviado (SHIPPED):** Paquetes entregados al transportista. Se ha adjuntado la guía de rastreo física para su monitoreo en el portal.",
  "**Cancelado (CANCELLED):** Compra anulada por el cliente o debido a la falta de fondos en el plazo estipulado."
];
currentY = drawBulletList(doc, orderStatuses, currentY, 8.5, COLOR_TEXT, 4.0, 1.2);

// Sección 6: Contacto y Soporte
currentY = drawSectionHeader(doc, "6. Centro de Atención y Soporte CTI Systems", currentY);

// Tarjeta de contacto dibujada a mano
const cardH = 20;
doc.setFillColor(COLOR_LIGHT_BG[0], COLOR_LIGHT_BG[1], COLOR_LIGHT_BG[2]);
doc.roundedRect(margin, currentY, usableW, cardH, 2, 2, 'F');
doc.setDrawColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
doc.setLineWidth(0.3);
doc.roundedRect(margin, currentY, usableW, cardH, 2, 2, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
doc.text("CTI SYSTEMS", margin + 5, currentY + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
doc.text(`Teléfono: 222 239 9000  |  Email: contacto@ctisystems.mx`, margin + 5, currentY + 11);
doc.text(`Dirección Fiscal: Blvd. Municipio Libre 1959-10B, Col. Otra no especificada en el catálogo, CP. 72480, Heroica Puebla de Zaragoza, Pue.`, margin + 5, currentY + 16);

// Decoraciones de la tercera página
addPageDecorations(doc, 3, 3);

// Guardar el PDF en la raíz del proyecto
const outputPath = path.join(__dirname, "..", "Guia_Clientes_Envio_y_Pago_CTI.pdf");
try {
  doc.save(outputPath);
  console.log(`\n======================================================`);
  console.log(`¡Guía en PDF creada con éxito!`);
  console.log(`Ruta del archivo: ${outputPath}`);
  console.log(`======================================================\n`);
} catch (error) {
  console.error("Error al guardar la guía PDF:", error);
}
