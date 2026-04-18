import React from 'react';
import Footer from '../components/Footer/Footer';
import Head from 'next/head';
import { useEnv } from '../context/EnvContext';

const CodigoDeEtica = () => {
	const {
		storeName,
		metaDescription,
		titlePostDescription,
		contactEmail,
		phone,
		legalName,
		pageUrl,
		rfc,
		address,
	} = useEnv();

	const ldWeb = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: `Código de Ética | ${storeName}`,
		url: pageUrl || '',
		inLanguage: 'es-MX',
		about: storeName,
	};

	const ldOrg = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: storeName,
		legalName,
		url: pageUrl && pageUrl.startsWith('http') ? new URL(pageUrl).origin : '',
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
				<title>{`Código de Ética | ${storeName}: ${titlePostDescription}`}</title>
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
						<h1>Código de Ética — {storeName.toUpperCase()}</h1>
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
										<a href='#proposito'>1) Propósito y alcance</a>
									</li>
									<li>
										<a href='#principios'>2) Principios éticos</a>
									</li>
									<li>
										<a href='#comercial'>
											3) Prácticas comerciales responsables
										</a>
									</li>
									<li>
										<a href='#publicidad'>4) Publicidad digital responsable</a>
									</li>
									<li>
										<a href='#datos'>5) Privacidad y protección de datos</a>
									</li>
									<li>
										<a href='#vulnerables'>
											6) Personas menores y grupos vulnerables
										</a>
									</li>
									<li>
										<a href='#reseñas'>7) Reseñas y reputación online</a>
									</li>
									<li>
										<a href='#pagos'>8) Seguridad de pagos y antifraude</a>
									</li>
									<li>
										<a href='#pi'>9) Propiedad intelectual y contenidos</a>
									</li>
									<li>
										<a href='#cumplimiento'>10) Cumplimiento normativo</a>
									</li>
									<li>
										<a href='#conflictos'>
											11) Atención a clientes y solución de controversias
										</a>
									</li>
									<li>
										<a href='#vigilancia'>12) Vigilancia interna y reporte</a>
									</li>
									<li>
										<a href='#cambios'>13) Actualizaciones y vigencia</a>
									</li>
									<li>
										<a href='#contacto'>14) Identidad y contacto</a>
									</li>
								</ul>
							</div>
						</nav>

						<article className='policy__content'>
							<section id='proposito'>
								<h2>1) Propósito y alcance</h2>
								<p>
									Este Código fija los valores y estándares mínimos que rigen
									las operaciones de comercio electrónico de{' '}
									<strong>{storeName}</strong>, operado por{' '}
									<strong>{legalName}</strong>, en{' '}
									<a href={pageUrl} target='_blank' rel='noopener noreferrer'>
										{pageUrl}
									</a>
									. Busca proteger los derechos del consumidor, promover
									prácticas transparentes y prevenir información engañosa.
								</p>
							</section>

							<section id='principios'>
								<h2>2) Principios éticos</h2>
								<ul>
									<li>
										<strong>Legalidad y veracidad:</strong> la información
										publicada será exacta, comprobable y actualizada.
									</li>
									<li>
										<strong>Transparencia:</strong> identidad, contacto, precios
										(incluyendo si incorporan IVA), disponibilidad, tiempos de
										entrega y políticas visibles y coherentes con nuestra
										configuración en Merchant Center.
									</li>
									<li>
										<strong>No discriminación:</strong> respeto a todas las
										personas usuarias.
									</li>
									<li>
										<strong>Seguridad:</strong> protección de datos personales y
										operaciones bajo SSL/TLS.
									</li>
									<li>
										<strong>Responsabilidad:</strong> corregir errores y atender
										reclamaciones de forma oportuna.
									</li>
								</ul>
							</section>

							<section id='comercial'>
								<h2>3) Prácticas comerciales responsables</h2>
								<ul>
									<li>
										<strong>Información de producto:</strong> fichas técnicas
										claras (marca, modelo/SKU, especificaciones). Las imágenes
										son ilustrativas.
									</li>
									<li>
										<strong>Precios y disponibilidad:</strong> mostrados en MXN
										e indicando si incluyen IVA; disponibilidad coherente con el
										stock real.
									</li>
									<li>
										<strong>Entrega:</strong> <em>Preparación</em> hasta{' '}
										<strong>48 horas hábiles</strong> (handling 0–2 d/h) y{' '}
										<em>tránsito</em> estimado <strong>3–5 días hábiles</strong>{' '}
										en México.
									</li>
									<li>
										<strong>Devoluciones:</strong> aceptamos desistimiento y DOA
										dentro de <strong>30 días naturales</strong>; en
										desistimiento puede aplicarse{' '}
										<strong>depreciación del 20%</strong> si hay uso o
										faltantes. Ver{' '}
										<a href='/politicas-de-devolucion'>
											Política de Devoluciones
										</a>
										.
									</li>
									<li>
										<strong>Garantías:</strong> se atienden con el
										fabricante/centro autorizado según marca/modelo.
									</li>
									<li>
										<strong>Compatibilidad (cómputo):</strong> la persona
										compradora verifica compatibilidad (socket, potencia,
										dimensiones); piezas instaladas o con sellos rotos se
										canalizan a garantía.
									</li>
								</ul>
							</section>

							<section id='publicidad'>
								<h2>4) Publicidad digital responsable</h2>
								<ul>
									<li>
										La publicidad será identificable como tal y no inducirá a
										error (prohibido “precio ancla” engañoso o claims no
										verificables).
									</li>
									<li>
										Ofertas y promociones indicarán <strong>vigencia</strong>,{' '}
										<strong>restricciones</strong> y <strong>cupo</strong>{' '}
										cuando aplique.
									</li>
									<li>
										Colaboraciones con influencers estarán debidamente
										etiquetadas como contenido patrocinado.
									</li>
									<li>
										No haremos comparativas denigrantes; cualquier comparación
										será objetiva y comprobable.
									</li>
								</ul>
							</section>

							<section id='datos'>
								<h2>5) Privacidad y protección de datos</h2>
								<p>
									Tratamos los datos conforme a nuestro{' '}
									<a href='/aviso-de-privacidad'>Aviso de Privacidad</a> y la
									LFPDPPP: finalidad, consentimiento, ARCO, medidas de
									seguridad, transferencias y conservación. Pagos procesados por
									proveedores certificados; {storeName} no almacena el PAN
									completo de tarjetas.
								</p>
							</section>

							<section id='vulnerables'>
								<h2>6) Personas menores y grupos vulnerables</h2>
								<ul>
									<li>
										El sitio está dirigido a mayores de edad. Pedimos que niñas,
										niños y adolescentes no realicen compras sin tutela.
									</li>
									<li>
										La comunicación evitará incitar compras aprovechando
										inexperiencia o credulidad.
									</li>
									<li>
										Evitamos contenido que pueda resultar perjudicial o
										riesgoso.
									</li>
								</ul>
							</section>

							<section id='reseñas'>
								<h2>7) Reseñas y reputación online</h2>
								<ul>
									<li>
										Fomentamos reseñas auténticas; no compramos ni fabricamos
										opiniones.
									</li>
									<li>
										Reportes de reseñas fraudulentas o calumniosas podrán
										moderarse conforme a criterios objetivos.
									</li>
								</ul>
							</section>

							<section id='pagos'>
								<h2>8) Seguridad de pagos y antifraude</h2>
								<ul>
									<li>
										Podemos solicitar verificación adicional en pedidos de alto
										riesgo (identificación/validación bancaria).
									</li>
									<li>
										Pagos no aprobados o con contracargo pueden cancelarse para
										proteger a las partes.
									</li>
								</ul>
							</section>

							<section id='pi'>
								<h2>9) Propiedad intelectual y contenidos</h2>
								<p>
									Textos, imágenes, marcas y fichas técnicas pertenecen a{' '}
									{storeName} o sus titulares. Se prohíbe su uso no autorizado.
								</p>
							</section>

							<section id='cumplimiento'>
								<h2>10) Cumplimiento normativo</h2>
								<p>
									Observamos la Constitución, la Ley Federal de Protección al
									Consumidor, la LFPDPPP y la Norma Mexicana de Comercio
									Electrónico <strong>NMX-COE-001-SCFI-2018</strong>, además de
									políticas de plataformas (incluyendo Google Merchant Center)
									para evitar información engañosa.
								</p>
							</section>

							<section id='conflictos'>
								<h2>11) Atención a clientes y solución de controversias</h2>
								<ul>
									<li>
										Atención en{' '}
										<a href={`mailto:${contactEmail}`}>{contactEmail}</a> y Tel.{' '}
										<strong>{phone}</strong>, L–V 9:00–18:00 h.
									</li>
									<li>
										Buscamos resolver por vía directa, mediación y conciliación.
										El cliente puede acudir a PROFECO conforme a derecho.
									</li>
								</ul>
							</section>

							<section id='vigilancia'>
								<h2>12) Vigilancia interna y reporte</h2>
								<ul>
									<li>
										Contamos con procedimientos internos para monitorear el
										cumplimiento de este Código y corregir desviaciones.
									</li>
									<li>
										Quejas o reportes de incumplimiento:{' '}
										<a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
									</li>
								</ul>
							</section>

							<section id='cambios'>
								<h2>13) Actualizaciones y vigencia</h2>
								<p>
									Este Código puede actualizarse para reforzar buenas prácticas
									o cumplir cambios normativos. La versión vigente es la
									publicada en esta página.
								</p>
							</section>

							<section id='contacto'>
								<h2>14) Identidad y contacto</h2>
								<p>
									<strong>{legalName}</strong> — {storeName}
									<br />
									RFC: {rfc}
									<br />
									Domicilio: {address}
									<br />
									Tel.: {phone} — Correo:{' '}
									<a href={`mailto:${contactEmail}`}>{contactEmail}</a>
								</p>
							</section>
						</article>
					</div>
				</div>
			</div>

			<Footer />

			{/* ---- STYLES (mismos que Devoluciones) ---- */}
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

export default CodigoDeEtica;
