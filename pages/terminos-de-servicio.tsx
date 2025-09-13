import React from 'react';
import Footer from '../components/Footer/Footer';
import Head from 'next/head';
import { useEnv } from '../context/EnvContext';

const TerminosDeServicio = () => {
	const {
		storeName,
		metaDescription,
		titlePostDescription,
		legalName,
		contactEmail,
		rfc,
		phone,
		address,
	} = useEnv();

	// JSON-LD: WebPage + Organization (transparencia para Google/Merchant)
	const ldWeb = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: `Términos del Servicio | ${storeName}`,
		url: typeof window !== 'undefined' ? window.location.href : '',
		inLanguage: 'es-MX',
		about: storeName,
	};

	const ldOrg = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: storeName,
		legalName,
		url: typeof window !== 'undefined' ? window.location.origin : '',
		contactPoint: [
			{
				'@type': 'ContactPoint',
				contactType: 'customer service',
				email: contactEmail,
				telephone: phone,
				areaServed: 'MX',
				availableLanguage: ['es', 'es-MX'],
			},
		],
		address: {
			'@type': 'PostalAddress',
			streetAddress: address,
			addressCountry: 'MX',
		},
	};

	return (
		<div className='policy-page'>
			<Head>
				<title>{`Términos del Servicio | ${storeName}: ${titlePostDescription}`}</title>
				<meta name='description' content={`${metaDescription}`} />
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(ldWeb) }}
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(ldOrg) }}
				/>
			</Head>

			<div className='container'>
				<div className='policy__container'>
					<div className='policy__title'>
						<h1>Términos del Servicio</h1>
						<p className='subtitle'>
							Última actualización: 13 de septiembre de 2025
						</p>
					</div>

					<div className='policy__body'>
						{/* Índice anclado */}
						<nav aria-label='Índice' className='policy__toc'>
							<div className='toc__card'>
								<p className='toc__title'>Contenido</p>
								<ul>
									<li>
										<a href='#identidad'>1) Identidad y contacto</a>
									</li>
									<li>
										<a href='#alcance'>2) Alcance y aceptación</a>
									</li>
									<li>
										<a href='#cuentas'>3) Cuentas y seguridad</a>
									</li>
									<li>
										<a href='#compra'>4) Proceso de compra y disponibilidad</a>
									</li>
									<li>
										<a href='#precios'>5) Precios, impuestos y facturación</a>
									</li>
									<li>
										<a href='#pagos'>
											6) Métodos de pago y verificación antifraude
										</a>
									</li>
									<li>
										<a href='#envios'>7) Envíos y entrega</a>
									</li>
									<li>
										<a href='#devoluciones'>
											8) Devoluciones, cambios y reembolsos
										</a>
									</li>
									<li>
										<a href='#garantias'>9) Garantías del fabricante / DOA</a>
									</li>
									<li>
										<a href='#compatibilidad'>
											10) Compatibilidad e instalación
										</a>
									</li>
									<li>
										<a href='#sobrepedido'>
											11) Productos sobre pedido / preventa
										</a>
									</li>
									<li>
										<a href='#propiedad'>12) Propiedad intelectual</a>
									</li>
									<li>
										<a href='#conducta'>13) Conducta prohibida</a>
									</li>
									<li>
										<a href='#responsabilidad'>
											14) Limitación de responsabilidad
										</a>
									</li>
									<li>
										<a href='#privacidad'>15) Privacidad y datos personales</a>
									</li>
									<li>
										<a href='#fuerza'>16) Fuerza mayor</a>
									</li>
									<li>
										<a href='#cambios'>17) Cambios a estos términos</a>
									</li>
									<li>
										<a href='#ley'>
											18) Ley aplicable y resolución de disputas
										</a>
									</li>
									<li>
										<a href='#contacto'>19) Contacto</a>
									</li>
								</ul>
							</div>
						</nav>

						<article className='policy__content'>
							<section id='identidad'>
								<h2>1) Identidad y contacto</h2>
								<p>
									Estos Términos regulan el uso del sitio y las compras
									realizadas en <strong>{storeName}</strong>, operado por{' '}
									<strong>{legalName}</strong>, RFC <strong>{rfc}</strong>, con
									domicilio en <strong>{address}</strong>. Atención a clientes:{' '}
									<a href={`mailto:${contactEmail}`}>{contactEmail}</a> — Tel.{' '}
									<strong>{phone}</strong>.
								</p>
							</section>

							<section id='alcance'>
								<h2>2) Alcance y aceptación</h2>
								<p>
									Al navegar, crear una cuenta o comprar en el sitio aceptas
									estos Términos. Si no estás de acuerdo, por favor no utilices
									el sitio. Nos reservamos el derecho de actualizar este
									documento; los cambios aplican desde su publicación.
								</p>
							</section>

							<section id='cuentas'>
								<h2>3) Cuentas y seguridad</h2>
								<ul>
									<li>
										Debes ser mayor de edad para comprar. Eres responsable de la
										confidencialidad de tus credenciales.
									</li>
									<li>
										Podemos suspender cuentas por actividad fraudulenta, abuso
										del sistema de devoluciones o incumplimiento de estos
										Términos.
									</li>
								</ul>
							</section>

							<section id='compra'>
								<h2>4) Proceso de compra y disponibilidad</h2>
								<ul>
									<li>
										Tu pedido se confirma cuando recibes el correo de{' '}
										<strong>“Pedido confirmado”</strong>. En pagos diferidos o
										transferencias, el procesamiento inicia cuando el pago se
										acredita.
									</li>
									<li>
										Si un producto se agota o existe un error evidente (precio,
										especificación, imagen), podremos cancelar y reembolsar
										íntegramente.
									</li>
									<li>
										Las imágenes son ilustrativas; verifica siempre el
										SKU/modelo y la ficha técnica del fabricante.
									</li>
								</ul>
							</section>

							<section id='precios'>
								<h2>5) Precios, impuestos y facturación</h2>
								<ul>
									<li>
										Los precios se muestran en <strong>MXN</strong> e indican si{' '}
										<strong>incluyen IVA</strong>.
									</li>
									<li>
										Emitimos CFDI a solicitud del cliente dentro del mes fiscal
										correspondiente, con los datos correctos proporcionados en
										checkout.
									</li>
									<li>
										Promociones y cupones no son acumulables salvo indicación
										expresa.
									</li>
								</ul>
							</section>

							<section id='pagos'>
								<h2>6) Métodos de pago y verificación antifraude</h2>
								<ul>
									<li>
										Aceptamos métodos de pago mostrados en checkout (p. ej.,
										tarjeta, Mercado Pago, PayPal, diferidos autorizados).
									</li>
									<li>
										Para pedidos de alto valor podemos solicitar verificación
										adicional (identificación oficial, comprobante de domicilio
										o validación del banco). El{' '}
										<strong>tiempo de preparación</strong> comienza tras aprobar
										la verificación.
									</li>
									<li>
										Pagos no aprobados o con contracargos pueden resultar en
										cancelación del pedido.
									</li>
								</ul>
							</section>

							<section id='envios'>
								<h2>7) Envíos y entrega</h2>
								<ul>
									<li>
										<strong>Preparación:</strong> hasta{' '}
										<strong>48 horas hábiles</strong> (handling time 0–2 días
										hábiles).
									</li>
									<li>
										<strong>Tránsito de paquetería:</strong> estimado de{' '}
										<strong>3 a 5 días hábiles</strong> en México. Fines de
										semana y feriados no cuentan como hábiles.
									</li>
									<li>
										Recibirás número de guía al despacho. Consulta condiciones
										completas en nuestra{' '}
										<a href='/politicas-de-envios'>Política de Envíos</a>.
									</li>
								</ul>
							</section>

							<section id='devoluciones'>
								<h2>8) Devoluciones, cambios y reembolsos</h2>
								<ul>
									<li>
										Aceptamos devoluciones por <strong>desistimiento</strong> y
										por <strong>defecto/DOA</strong> dentro de{' '}
										<strong>30 días naturales</strong> desde la entrega,
										conforme a{' '}
										<a href='/politicas-de-devolucion'>
											Política de Devoluciones
										</a>
										.
									</li>
									<li>
										En desistimiento, el cliente <strong>cubre</strong> el envío
										de regreso. Si el artículo llega con uso, faltante o empaque
										dañado, podrá aplicarse{' '}
										<strong>depreciación del 20%</strong>.
									</li>
									<li>
										Procesamos reembolsos en <strong>3–5 días hábiles</strong>{' '}
										tras la aprobación; el abono final depende del emisor (5–15
										días hábiles adicionales).
									</li>
								</ul>
							</section>

							<section id='garantias'>
								<h2>9) Garantías del fabricante / DOA</h2>
								<ul>
									<li>
										Todos los productos cuentan con garantía del
										fabricante/centro autorizado (plazo según marca/modelo).
									</li>
									<li>
										Para DOA/defecto inicial reportado dentro de 30 días,
										gestionamos RMA conforme a nuestra política.
									</li>
								</ul>
							</section>

							<section id='compatibilidad'>
								<h2>10) Compatibilidad e instalación</h2>
								<ul>
									<li>
										El cliente es responsable de verificar{' '}
										<strong>compatibilidad</strong> (socket, chipset, formato,
										potencia, dimensiones, BIOS/firmware) antes de instalar.
									</li>
									<li>
										Componentes instalados o con sellos rotos se canalizan a
										garantía y pueden quedar excluidos de devolución por
										desistimiento.
									</li>
									<li>
										No asumimos pérdida de datos ni daños por instalación
										incorrecta, sobrevoltaje o uso de accesorios no originales.
									</li>
								</ul>
							</section>

							<section id='sobrepedido'>
								<h2>11) Productos sobre pedido / preventa</h2>
								<ul>
									<li>
										Los artículos señalados como “sobre pedido” o “preventa”
										requieren tiempo adicional previo al despacho; la fecha
										estimada se mostrará en la ficha del producto o en checkout.
									</li>
									<li>
										Si el proveedor aplaza o cancela, podrás optar por esperar,
										cambiar por un producto equivalente o solicitar reembolso.
									</li>
								</ul>
							</section>

							<section id='propiedad'>
								<h2>12) Propiedad intelectual</h2>
								<p>
									El contenido del sitio (textos, imágenes, logotipos, fichas)
									pertenece a {storeName} o a sus respectivos titulares y se
									encuentra protegido por la legislación aplicable. Queda
									prohibida su reproducción no autorizada.
								</p>
							</section>

							<section id='conducta'>
								<h2>13) Conducta prohibida</h2>
								<p>
									No podrás usar el sitio con fines ilícitos, para enviar
									malware, realizar fraude, suplantar identidad, extraer datos
									sin autorización o vulnerar derechos de propiedad intelectual.
								</p>
							</section>

							<section id='responsabilidad'>
								<h2>14) Limitación de responsabilidad</h2>
								<p>
									En la medida permitida por la ley, {storeName} no será
									responsable por daños indirectos o consecuenciales derivados
									del uso del sitio, de la instalación incorrecta de productos o
									de retrasos atribuibles a paqueterías o a causas de fuerza
									mayor.
								</p>
							</section>

							<section id='privacidad'>
								<h2>15) Privacidad y datos personales</h2>
								<p>
									El tratamiento de datos se rige por nuestro{' '}
									<a href='/aviso-de-privacidad'>Aviso de Privacidad</a>. Al
									comprar aceptas el uso de tus datos para procesar el pedido,
									facturar, enviar y brindar soporte postventa.
								</p>
							</section>

							<section id='fuerza'>
								<h2>16) Fuerza mayor</h2>
								<p>
									No seremos responsables por incumplimientos ocasionados por
									hechos fuera de nuestro control razonable (desastres, fallos
									masivos de servicios, huelgas, restricciones sanitarias,
									etc.).
								</p>
							</section>

							<section id='cambios'>
								<h2>17) Cambios a estos términos</h2>
								<p>
									Podemos actualizar estos Términos. La versión vigente será la
									publicada en esta página, con su fecha de actualización.
								</p>
							</section>

							<section id='ley'>
								<h2>18) Ley aplicable y resolución de disputas</h2>
								<p>
									Este acuerdo se rige por las leyes de los Estados Unidos
									Mexicanos. Ante cualquier controversia, las partes buscarán
									primero una solución directa con nuestro equipo de soporte. De
									persistir el conflicto, las partes se someten a los tribunales
									competentes de nuestra localidad, sin perjuicio de los
									derechos del consumidor que resulten aplicables.
								</p>
							</section>

							<section id='contacto'>
								<h2>19) Contacto</h2>
								<p>
									<strong>{legalName}</strong> — RFC {rfc}
									<br />
									<strong>Tel.:</strong> {phone}
									<br />
									<strong>Correo:</strong>{' '}
									<a href={`mailto:${contactEmail}`}>{contactEmail}</a>
									<br />
									<strong>Domicilio:</strong> {address}
								</p>
							</section>
						</article>
					</div>
				</div>
			</div>

			<Footer />

			{/* ---- STYLES (mismos de Devoluciones) ---- */}
			<style jsx>{`
				:global(html) {
					scroll-behavior: smooth;
				}
				.container {
					padding: 24px 16px;
				}
				.policy__container {
					max-width: 1160px;
					margin: 0 auto;
				}
				.policy__title {
					margin-bottom: 40px;
					text-align: center;
				}
				.policy__title h1 {
					font-size: 2rem;
					line-height: 1.2;
					margin: 0 0 6px;
					font-weight: 800;
					letter-spacing: -0.2px;
				}
				.subtitle {
					margin: 0;
					font-size: 0.95rem;
					color: #6b7280;
				}
				.policy__body {
					display: grid;
					grid-template-columns: 280px 1fr;
					gap: 28px;
					align-items: start;
				}
				.policy__toc .toc__card {
					position: sticky;
					top: 84px;
					background: #ffffff;
					border: 1px solid #eaeaea;
					border-radius: 8px;
					padding: 16px;
					box-shadow: 0 1px 3px #0000000d;
				}
				.toc__title {
					margin: 0 0 10px;
					font-weight: 700;
					font-size: 0.95rem;
					color: #374151;
				}
				.policy__toc ul {
					list-style: none;
					margin: 0;
					padding: 0;
				}
				.policy__toc li + li {
					margin-top: 6px;
				}
				.policy__toc a {
					display: block;
					padding: 8px 10px;
					border-radius: 5px;
					text-decoration: none;
					font-size: 0.95rem;
					border: 1px solid transparent;
					transition: all 0.2s ease;
				}
				.policy__toc a:hover {
					background: var(--background-price-color);
					border-color: var(--primary-color);
					color: var(--primary-color);
				}
				.policy__content {
					background: #ffffff;
					border: 1px solid #eaeaea;
					border-radius: 8px;
					padding: 28px;
					box-shadow: 0 1px 3px #0000000d;
					font-size: 1.0625rem;
					line-height: 1.75;
				}
				.policy__content section + section {
					margin-top: 26px;
					padding-top: 8px;
					border-top: 1px dashed #eaeaea;
				}
				.policy__content h2 {
					font-size: 1.25rem;
					line-height: 1.4;
					margin: 0 0 10px;
					font-weight: 800;
					letter-spacing: -0.2px;
				}
				.policy__content p {
					margin: 0 0 12px;
				}
				.policy__content ul,
				.policy__content ol {
					margin: 0 0 12px 1.2rem;
				}
				.policy__content li {
					margin: 6px 0;
				}
				.policy__content a {
					color: var(--primary-color);
					text-decoration: underline;
					text-underline-offset: 2px;
				}
				.policy__content :target h2 {
					background: var(--background-price-color);
					border-left: 4px solid var(--primary-color);
					padding-left: 8px;
					border-radius: 5px;
				}
				@media (max-width: 1024px) {
					.policy__body {
						grid-template-columns: 1fr;
					}
					.policy__toc .toc__card {
						position: static;
					}
				}
				@media (max-width: 640px) {
					.policy__content {
						padding: 10px;
						font-size: 1rem;
					}
					.policy__title h1 {
						font-size: 1.6rem;
					}
				}
			`}</style>
		</div>
	);
};

export default TerminosDeServicio;
