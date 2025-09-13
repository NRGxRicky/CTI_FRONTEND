import React from 'react';
import Footer from '../components/Footer/Footer';
import Head from 'next/head';
import { useEnv } from '../context/EnvContext';

const PoliticasDeDevolucion = () => {
	const {
		storeName,
		metaDescription,
		titlePostDescription,
		contactEmail,
		legalName,
		rfc,
		phone,
		address,
	} = useEnv();

	// JSON-LD para Google (MerchantReturnPolicy) — incluye restockingFee 20%
	const returnPolicyLd = {
		'@context': 'https://schema.org',
		'@type': 'MerchantReturnPolicy',
		applicableCountry: 'MX',
		returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
		merchantReturnDays: 30,
		inStoreReturnsOffered: false,
		returnMethod: 'https://schema.org/ReturnByMail',
		// En desistimiento el cliente paga el envío de regreso:
		returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
		customerRemorseReturnFees:
			'https://schema.org/ReturnFeesCustomerResponsibility',
		// Tarifa de aprovisionamiento (restocking fee) coherente con MC:
		restockingFee: 20, // % del precio del producto
	};

	return (
		<div className='policy-page'>
			<Head>
				<title>{`Política de Devolución | ${storeName}: ${titlePostDescription}`}</title>
				<meta name='description' content={`${metaDescription}`} />
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(returnPolicyLd) }}
				/>
			</Head>

			<div className='container'>
				<div className='policy__container'>
					<div className='policy__title'>
						<h1>Política de Devoluciones y Reembolsos</h1>
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
										<a href='#alcance'>1) Alcance</a>
									</li>
									<li>
										<a href='#ventana'>2) Ventana de devolución</a>
									</li>
									<li>
										<a href='#condiciones'>3) Condiciones generales</a>
									</li>
									<li>
										<a href='#excepciones'>4) Excepciones</a>
									</li>
									<li>
										<a href='#costos'>5) Costos de envío</a>
									</li>
									<li>
										<a href='#proceso'>6) Proceso (RMA)</a>
									</li>
									<li>
										<a href='#reembolsos'>7) Reembolsos</a>
									</li>
									<li>
										<a href='#depreciacion'>8) Depreciación</a>
									</li>
									<li>
										<a href='#garantias'>9) Garantías / DOA</a>
									</li>
									<li>
										<a href='#cumplimiento'>10) Entregas y oferta</a>
									</li>
									<li>
										<a href='#precios'>11) Precios e impuestos</a>
									</li>
									<li>
										<a href='#contacto'>12) Contacto</a>
									</li>
								</ul>
							</div>
						</nav>

						<article className='policy__content'>
							<section id='alcance'>
								<h2>1) Alcance</h2>
								<p>
									Esta política aplica a compras realizadas en{' '}
									<strong>{storeName}</strong> por consumidores dentro de la
									República Mexicana. En todo momento respetamos los derechos
									del consumidor previstos en la legislación aplicable en
									México.
								</p>
							</section>

							<section id='ventana'>
								<h2>2) Ventana de devolución</h2>
								<ul>
									<li>
										<strong>Desistimiento (me arrepentí):</strong> 30 días
										naturales a partir de la fecha de entrega.
									</li>
									<li>
										<strong>Daño de transporte o contenido incompleto:</strong>{' '}
										repórtalo dentro de las <strong>primeras 48 horas</strong>{' '}
										con fotos del empaque y del producto.
									</li>
									<li>
										<strong>Defecto de fabricación / DOA:</strong> 30 días
										naturales desde la entrega.
									</li>
								</ul>
								<p>
									Pasado ese periodo, procede la{' '}
									<strong>garantía del fabricante</strong> conforme a sus
									términos.
								</p>
							</section>

							<section id='condiciones'>
								<h2>3) Condiciones generales para aceptar una devolución</h2>
								<ul>
									<li>
										Producto <strong>sin uso</strong>, en{' '}
										<strong>condición de nuevo</strong>.
									</li>
									<li>
										<strong>Empaque original</strong> en buen estado, con{' '}
										<strong>todos</strong> los accesorios, manuales, cables,
										etiquetas y números de serie.
									</li>
									<li>
										<strong>Sellos de garantía</strong> y hologramas intactos.
									</li>
									<li>
										Sin <strong>daño físico</strong>, humedad, golpes,
										sobrevoltajes, modificaciones o instalación inadecuada.
									</li>
								</ul>
								<p>
									Si el producto fue instalado o muestra uso, se canaliza a{' '}
									<strong>garantía</strong> (reparación o cambio) tras
									diagnóstico del fabricante/centro autorizado.
								</p>
							</section>

							<section id='excepciones'>
								<h2>4) Excepciones</h2>
								<p>
									No aceptamos devolución por desistimiento (sí por DOA/garantía
									según diagnóstico) en:
								</p>
								<ul>
									<li>
										<strong>Software</strong>, licencias, claves digitales,
										suscripciones y descargas.
									</li>
									<li>
										<strong>Consumibles abiertos</strong> (tintas, tóner, papel
										fotográfico).
									</li>
									<li>
										<strong>Componentes electrónicos</strong> instalados o
										manipulados: CPU, motherboards, RAM, GPU, SSD/HDD, fuentes,
										ventiladores, etc.
									</li>
									<li>
										<strong>Equipos armados a la medida</strong> o
										configuraciones personalizadas.
									</li>
									<li>
										Productos con <strong>sellos de garantía rotos</strong> o
										números de serie no coincidentes.
									</li>
								</ul>
							</section>

							<section id='costos'>
								<h2>5) Costos de envío en devoluciones</h2>
								<ul>
									<li>
										<strong>Desistimiento:</strong> el cliente{' '}
										<strong>cubre</strong> el envío de regreso.
									</li>
									<li>
										<strong>Error de {storeName}</strong> (producto
										incorrecto/faltante) o <strong>defecto inicial</strong>{' '}
										confirmado en 30 días: {storeName} <strong>cubre</strong> el
										retorno y el reenvío.
									</li>
									<li>
										Daño por paquetería reportado dentro de 48 h: {storeName}{' '}
										gestiona el caso; <strong>no generará costo</strong> para el
										cliente.
									</li>
								</ul>
							</section>

							<section id='proceso'>
								<h2>6) Proceso de devolución (RMA)</h2>
								<ol>
									<li>
										<strong>Solicita tu RMA</strong> dentro del plazo aplicable
										vía teléfono o formulario de contacto. Indica{' '}
										<em>número de pedido</em>, <em>SKU/modelo</em>,{' '}
										<em>serie</em> (si aplica) y motivo con{' '}
										<strong>evidencia fotográfica</strong>.
									</li>
									<li>
										Recibirás instrucciones y, si corresponde,{' '}
										<strong>guía prepagada</strong> o la dirección de retorno.
									</li>
									<li>
										Al recibir el paquete, realizamos{' '}
										<strong>revisión técnica</strong> (1–3 días hábiles).
									</li>
									<li>
										Te notificamos el resultado y la acción:{' '}
										<strong>reemplazo</strong>, <strong>nota de crédito</strong>{' '}
										o <strong>reembolso</strong>.
									</li>
								</ol>
							</section>

							<section id='reembolsos'>
								<h2>7) Reembolsos: método y tiempos</h2>
								<ul>
									<li>
										Se emiten al <strong>método de pago original</strong>{' '}
										(tarjeta, Mercado Pago, PayPal, KueskiPay, Aplazo, etc.).
									</li>
									<li>
										Una vez aprobado, {storeName} procesa en{' '}
										<strong>3–5 días hábiles</strong>. El{' '}
										<strong>acreditamiento</strong> final depende del emisor
										(suele tomar <strong>5–15 días hábiles</strong>{' '}
										adicionales).
									</li>
									<li>
										En desistimiento, si hay empaque incompleto o uso evidente,
										podremos ofrecer <strong>nota de crédito</strong> o aplicar{' '}
										<strong>depreciación del 20%</strong> del valor del
										producto.
									</li>
								</ul>
							</section>

							<section id='depreciacion'>
								<h2>8) Depreciación (restocking fee)</h2>
								<p>
									En devoluciones por <strong>desistimiento</strong>, si el
									producto llega <strong>incompleto</strong>, con{' '}
									<strong>empaque dañado</strong> o presenta{' '}
									<strong>huellas de uso</strong>, {storeName} podrá aceptar la
									devolución aplicando una <strong>depreciación del 20%</strong>{' '}
									del valor del producto.
								</p>
								<p>
									No se aplica depreciación cuando la causa es{' '}
									<strong>defecto inicial</strong> o{' '}
									<strong>error de surtido</strong>.
								</p>
							</section>

							<section id='garantias'>
								<h2>9) Garantías del fabricante / DOA</h2>
								<ul>
									<li>
										Todos los productos cuentan con al menos{' '}
										<strong>1 año de garantía</strong> con el fabricante/centro
										autorizado (según marca/modelo).
									</li>
									<li>
										{storeName} te apoya con el{' '}
										<strong>canal de garantía</strong> y las instrucciones del
										centro autorizado.
									</li>
									<li>
										El tiempo de diagnóstico/reparación lo define el{' '}
										<strong>centro autorizado</strong>.
									</li>
									<li>
										Garantías no cubren <strong>daño físico</strong>, uso
										indebido, instalación incorrecta o accesorios de terceros
										que provoquen fallas.
									</li>
								</ul>
							</section>

							<section id='cumplimiento'>
								<h2>10) Entregas, demoras y cumplimiento con la oferta</h2>
								<p>
									Si un producto <strong>no corresponde</strong> a la{' '}
									<strong>marca, modelo, especificaciones o calidad</strong>{' '}
									ofertadas, o hay <strong>incumplimiento sustancial</strong> en
									lo anunciado, podrás <strong>rescindir</strong> y solicitar{' '}
									<strong>reembolso</strong> conforme a la legislación
									aplicable. En los supuestos previstos por la ley mexicana,
									procede además la bonificación correspondiente.
								</p>
							</section>

							<section id='precios'>
								<h2>11) Transparencia de precios e impuestos</h2>
								<ul>
									<li>
										Los precios publicados indican si{' '}
										<strong>incluyen IVA</strong>.
									</li>
									<li>
										El reembolso corresponderá al{' '}
										<strong>importe pagado</strong> (menos la{' '}
										<strong>depreciación del 20%</strong> cuando aplique por
										desistimiento).
									</li>
									<li>
										Los <strong>envíos</strong> no son reembolsables en
										desistimiento; sí cuando la causa sea{' '}
										<strong>error de {storeName}</strong> o{' '}
										<strong>defecto inicial</strong>.
									</li>
								</ul>
							</section>

							<section id='contacto'>
								<h2>12) ¿Cómo contactarnos?</h2>
								<p>
									<strong>{legalName}</strong> — RFC {rfc}
									<br />
									<strong>Tel.:</strong> {phone}
									<br />
									<strong>Correo:</strong>{' '}
									<a href={`mailto:${contactEmail}`}>{contactEmail}</a>
									<br />
									<strong>Dirección para devoluciones:</strong> {address}
									<br />
									<strong>Horario de atención:</strong> Lunes a Viernes de 9:00
									a 18:00 hrs
								</p>
							</section>
						</article>
					</div>
				</div>
			</div>

			<Footer />

			{/* ---- STYLES (igual que tu versión anterior) ---- */}
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

export default PoliticasDeDevolucion;
