import React from 'react';
import Footer from '../components/Footer/Footer';
import Head from 'next/head';
import { useEnv } from '../context/EnvContext';

const PoliticasDeEnvios = () => {
	const {
		storeName,
		metaDescription,
		titlePostDescription,
		contactEmail,
		phone,
	} = useEnv();

	return (
		<div className='policy-page'>
			<Head>
				<title>{`Políticas de Envíos | ${storeName}: ${titlePostDescription}`}</title>
				<meta name='description' content={`${metaDescription}`} />
			</Head>

			<div className='container'>
				<div className='policy__container'>
					<div className='policy__title'>
						<h1>Políticas de Envíos</h1>
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
										<a href='#alcance'>1) Alcance y cobertura</a>
									</li>
									<li>
										<a href='#tiempos'>2) Tiempos de preparación y entrega</a>
									</li>
									<li>
										<a href='#costos'>3) Modalidades y costos</a>
									</li>
									<li>
										<a href='#paqueterias'>4) Paqueterías, rastreo y firma</a>
									</li>
									<li>
										<a href='#zonas'>5) Zonas extendidas y restricciones</a>
									</li>
									<li>
										<a href='#empaque'>6) Empaque y seguro de envío</a>
									</li>
									<li>
										<a href='#fallidas'>
											7) Entregas fallidas y dirección incorrecta
										</a>
									</li>
									<li>
										<a href='#recepcion'>
											8) Recepción e inspección del paquete
										</a>
									</li>
									<li>
										<a href='#parciales'>
											9) Envíos parciales y productos “sobre pedido”
										</a>
									</li>
									<li>
										<a href='#contacto'>10) Contacto</a>
									</li>
								</ul>
							</div>
						</nav>

						<article className='policy__content'>
							<section id='alcance'>
								<h2>1) Alcance y cobertura</h2>
								<p>
									{storeName} realiza envíos{' '}
									<strong>a toda la República Mexicana</strong> mediante
									paqueterías con cobertura nacional. Los envíos internacionales
									no están disponibles.
								</p>
								<p>
									La información de esta política aplica a compras efectuadas en{' '}
									{storeName}. Los plazos y condiciones aquí descritos son
									independientes de las políticas de devolución y garantía.
								</p>
							</section>

							<section id='tiempos'>
								<h2>2) Tiempos de preparación y entrega</h2>
								<ul>
									<li>
										<strong>Preparación del pedido:</strong> hasta{' '}
										<strong>48 horas hábiles</strong> para validar pago,
										preparar y embalar. Pedidos confirmados fuera de horario
										hábil o en fines de semana/feriados inician proceso el
										siguiente día hábil.
									</li>
									<li>
										<strong>Tiempo de paquetería (tránsito):</strong> estimado
										de <strong>3 a 5 días hábiles</strong> una vez que la guía
										está activa y el paquete fue entregado a la paquetería.
									</li>
									<li>
										<strong>
											Tiempo total estimado = preparación + tránsito.
										</strong>{' '}
										En temporadas de alta demanda o incidencias operativas de la
										paquetería pueden ocurrir demoras extraordinarias.
									</li>
								</ul>
								<p>
									Fines de semana y días festivos <strong>no cuentan</strong>{' '}
									como días hábiles.
								</p>
							</section>

							<section id='costos'>
								<h2>3) Modalidades y costos</h2>
								<ul>
									<li>
										<strong>Método:</strong> envío{' '}
										<strong>por paquetería</strong> (“by mail”). No contamos con
										recolección en tienda física salvo que se indique
										explícitamente en checkout.
									</li>
									<li>
										<strong>Cálculo del costo:</strong> se determina en checkout
										según <strong>peso/volumen (peso volumétrico)</strong>,{' '}
										<strong>código postal</strong> y{' '}
										<strong>servicio disponible</strong>. El costo final se
										muestra antes de pagar.
									</li>
									<li>
										<strong>Dirección completa:</strong> el cliente debe
										proporcionar datos correctos y verificables (calle, número,
										colonia, C.P., ciudad, estado, referencias y teléfono).
									</li>
								</ul>
							</section>

							<section id='paqueterias'>
								<h2>4) Paqueterías, rastreo y firma</h2>
								<ul>
									<li>
										Tras procesar el pedido te enviaremos el{' '}
										<strong>número de guía</strong> y el{' '}
										<strong>enlace de rastreo</strong>.
									</li>
									<li>
										Para pedidos de <strong>alto valor</strong> podremos
										solicitar{' '}
										<strong>identificación y firma de recibido</strong>.
									</li>
									<li>
										La paquetería puede realizar hasta{' '}
										<strong>dos intentos</strong> de entrega; si no es posible,
										el envío podría permanecer en{' '}
										<strong>ocurre/sucursal</strong> para recolección con
										identificación oficial.
									</li>
								</ul>
							</section>

							<section id='zonas'>
								<h2>5) Zonas extendidas y restricciones</h2>
								<ul>
									<li>
										Algunas zonas pueden considerarse{' '}
										<strong>extendidas o de difícil acceso</strong> por la
										paquetería y generar tiempos adicionales y/o cargos
										especiales. De ser el caso, te lo notificaremos antes del
										despacho.
									</li>
									<li>
										Podrían existir restricciones para{' '}
										<strong>apartados postales</strong> (PO Box) y ubicaciones
										sin referencia geográfica precisa.
									</li>
									<li>
										Productos con <strong>baterías de litio</strong> o
										materiales regulados se envían bajo las normas aplicables
										(generalmente <strong>vía terrestre</strong>).
									</li>
								</ul>
							</section>

							<section id='empaque'>
								<h2>6) Empaque y seguro de envío</h2>
								<ul>
									<li>
										Todos los productos se embalan de forma segura; para{' '}
										<strong>componentes y equipos de cómputo</strong> usamos
										rellenos y protección contra golpes.
									</li>
									<li>
										Los envíos cuentan con <strong>cobertura/seguro</strong>{' '}
										provisto por la paquetería o por {storeName}. En caso de
										siniestro, gestionaremos el reporte conforme a sus términos.
									</li>
								</ul>
							</section>

							<section id='fallidas'>
								<h2>7) Entregas fallidas y dirección incorrecta</h2>
								<ul>
									<li>
										Si la dirección proporcionada es{' '}
										<strong>incorrecta o incompleta</strong>, el paquete podría
										ser devuelto a {storeName}. Para el <strong>reenvío</strong>
										, el cliente deberá cubrir el costo de un nuevo envío.
									</li>
									<li>
										En caso de <strong>rechazo del paquete</strong> sin causa
										imputable a {storeName}, aplican las mismas condiciones de
										reenvío.
									</li>
								</ul>
							</section>

							<section id='recepcion'>
								<h2>8) Recepción e inspección del paquete</h2>
								<p>
									Al recibir tu paquete, revisa que el{' '}
									<strong>empaque esté íntegro</strong> (sin golpes, humedad,
									aberturas o alteraciones). Si detectas anomalías, te sugerimos{' '}
									<strong>no recibir</strong> y reportarlo de inmediato con
									evidencias.
								</p>
								<p>
									Si aceptaste el paquete y detectas{' '}
									<strong>daño por transporte o contenido incompleto</strong>,
									deberás reportarlo a {storeName} dentro de las{' '}
									<strong>primeras 48 horas</strong> con fotografías del empaque
									y del producto para iniciar el reporte con la paquetería.
								</p>
							</section>

							<section id='parciales'>
								<h2>9) Envíos parciales y productos “sobre pedido”</h2>
								<ul>
									<li>
										En ocasiones, el pedido puede enviarse en{' '}
										<strong>múltiples paquetes (envíos parciales)</strong> sin
										costo adicional; recibirás una guía por paquete.
									</li>
									<li>
										Los productos marcados como{' '}
										<strong>“sobre pedido” o preventa</strong> pueden requerir
										un <strong>tiempo adicional</strong> previo al despacho.
										Esta condición se indica en la página del producto y en el
										checkout.
									</li>
								</ul>
							</section>

							<section id='contacto'>
								<h2>10) Contacto</h2>
								<p>
									¿Dudas sobre tu envío? Escríbenos a{' '}
									<a href={`mailto:${contactEmail}`}>{contactEmail}</a> o
									llámanos al <strong>{phone}</strong> en horario hábil.
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

export default PoliticasDeEnvios;
