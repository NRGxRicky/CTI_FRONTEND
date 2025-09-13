import React from 'react';
import Footer from '../components/Footer/Footer';
import Head from 'next/head';
import { useEnv } from '../context/EnvContext';

const PoliticaDePrivacidad = () => {
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

	// JSON-LD: WebPage (Privacy) + ContactPoint básico
	const ldWeb = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: `Aviso de Privacidad | ${storeName}`,
		url: pageUrl || '',
		inLanguage: 'es-MX',
		about: storeName,
	};

	const ldContact = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: storeName,
		legalName,
		url: pageUrl ? new URL(pageUrl).origin : '',
		contactPoint: [
			{
				'@type': 'ContactPoint',
				contactType: 'privacy',
				email: contactEmail,
				telephone: phone,
				areaServed: 'MX',
				availableLanguage: ['es', 'es-MX'],
			},
		],
	};

	return (
		<div className='policy-page'>
			<Head>
				<title>{`Aviso de Privacidad | ${storeName}: ${titlePostDescription}`}</title>
				<meta name='description' content={`${metaDescription}`} />
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(ldWeb) }}
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(ldContact) }}
				/>
			</Head>

			<div className='container'>
				<div className='policy__container'>
					<div className='policy__title'>
						<h1>Aviso de Privacidad</h1>
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
										<a href='#responsable'>1) Responsable e identidad</a>
									</li>
									<li>
										<a href='#datos'>2) Datos personales que recabamos</a>
									</li>
									<li>
										<a href='#finalidades'>3) Finalidades del tratamiento</a>
									</li>
									<li>
										<a href='#bases'>
											4) Bases de legitimación y consentimiento
										</a>
									</li>
									<li>
										<a href='#transferencias'>5) Transferencias y encargados</a>
									</li>
									<li>
										<a href='#conservacion'>6) Conservación de los datos</a>
									</li>
									<li>
										<a href='#seguridad'>7) Seguridad de la información</a>
									</li>
									<li>
										<a href='#cookies'>8) Cookies y tecnologías similares</a>
									</li>
									<li>
										<a href='#menores'>9) Menores de edad</a>
									</li>
									<li>
										<a href='#arco'>10) Derechos ARCO y revocación</a>
									</li>
									<li>
										<a href='#limitacion'>
											11) Medios para limitar el uso/divulgación
										</a>
									</li>
									<li>
										<a href='#cambios'>12) Cambios al aviso</a>
									</li>
									<li>
										<a href='#contacto'>13) Contacto del responsable</a>
									</li>
								</ul>
							</div>
						</nav>

						<article className='policy__content'>
							<section id='responsable'>
								<h2>1) Responsable e identidad</h2>
								<p>
									El responsable del tratamiento de sus datos personales es{' '}
									<strong>{legalName}</strong> (<strong>{storeName}</strong>),
									RFC <strong>{rfc}</strong>, con domicilio en{' '}
									<strong>{address}</strong>. Contacto de privacidad:{' '}
									<a href={`mailto:${contactEmail}`}>{contactEmail}</a> — Tel.{' '}
									<strong>{phone}</strong>.
								</p>
							</section>

							<section id='datos'>
								<h2>2) Datos personales que recabamos</h2>
								<ul>
									<li>
										<strong>Identificación y contacto:</strong> nombre,
										apellidos, correo, teléfono.
									</li>
									<li>
										<strong>Datos de dirección y facturación:</strong> domicilio
										de envío y facturación, razón social, RFC.
									</li>
									<li>
										<strong>Datos de transacción:</strong> productos adquiridos,
										importes, folios, estatus de pago y envío.
									</li>
									<li>
										<strong>Pagos:</strong> tokens y/o confirmaciones de
										pasarela.{' '}
										<em>No almacenamos números completos de tarjeta.</em>
									</li>
									<li>
										<strong>Soporte y RMA:</strong> comunicaciones, fotografías
										para diagnóstico, números de serie.
									</li>
									<li>
										<strong>Datos técnicos de navegación:</strong> IP
										aproximada, identificadores de dispositivo, cookies/SDK,
										páginas visitadas.
									</li>
								</ul>
							</section>

							<section id='finalidades'>
								<h2>3) Finalidades del tratamiento</h2>
								<p>
									<strong>Primarias (necesarias):</strong>
								</p>
								<ul>
									<li>
										Gestionar compras, cobros, facturación CFDI y entrega
										(handling 0–2 días hábiles y tránsito 3–5 días hábiles).
									</li>
									<li>
										Atender garantías/DOA, devoluciones y reembolsos conforme a
										nuestras políticas.
									</li>
									<li>
										Prevención de fraude, verificación de identidad y seguridad
										de la cuenta.
									</li>
									<li>
										Atención a clientes y soporte técnico (componentes de
										cómputo/compatibilidad).
									</li>
								</ul>
								<p>
									<strong>Secundarias (opcionales):</strong>
								</p>
								<ul>
									<li>
										Mercadotecnia, promociones y encuestas de satisfacción.
									</li>
									<li>
										Mejora del sitio, analítica y personalización de contenidos.
									</li>
								</ul>
								<p>
									Si no desea que tratemos sus datos para finalidades
									secundarias, puede <strong>optar por no participar</strong> en
									cualquier momento enviando correo a{' '}
									<a href={`mailto:${contactEmail}`}>{contactEmail}</a> o usando
									los enlaces de baja en nuestros emails.
								</p>
							</section>

							<section id='bases'>
								<h2>4) Bases de legitimación y consentimiento</h2>
								<ul>
									<li>
										<strong>Ejecución del contrato</strong> de compraventa y
										prestación de servicios.
									</li>
									<li>
										<strong>Interés legítimo</strong> (seguridad, prevención de
										fraude, mejora del servicio).
									</li>
									<li>
										<strong>Consentimiento</strong> para mercadotecnia y uso de
										cookies no esenciales; puede retirarlo en cualquier momento.
									</li>
								</ul>
							</section>

							<section id='transferencias'>
								<h2>5) Transferencias y encargados</h2>
								<p>
									Podemos compartir datos con <strong>encargados</strong>{' '}
									(proveedores que tratan datos por nuestra cuenta) para cumplir
									las finalidades primarias:
								</p>
								<ul>
									<li>
										<strong>Pasarelas de pago</strong> (autenticación y
										liquidación de transacciones).
									</li>
									<li>
										<strong>Paqueterías/logística</strong> (entrega, rastreo,
										siniestros).
									</li>
									<li>
										<strong>Soporte técnico/centros autorizados</strong>{' '}
										(RMA/garantías).
									</li>
									<li>
										<strong>Servicios de TI</strong> (hosting, email,
										analítica).
									</li>
								</ul>
								<p>
									En algunos casos, los datos pueden hospedarse o tratarse en{' '}
									<strong>otros países</strong>. Adoptamos medidas contractuales
									y de seguridad para salvaguardarlos. No vendemos datos
									personales.
								</p>
							</section>

							<section id='conservacion'>
								<h2>6) Conservación de los datos</h2>
								<ul>
									<li>
										<strong>Comercial/contable:</strong> por los plazos exigidos
										por la legislación mexicana (p. ej., comprobación fiscal y
										auditoría).
									</li>
									<li>
										<strong>Soporte y garantías:</strong> durante la vigencia de
										la garantía y la atención de postventa.
									</li>
									<li>
										<strong>Marketing:</strong> hasta que retire su
										consentimiento o ejercite oposición.
									</li>
								</ul>
							</section>

							<section id='seguridad'>
								<h2>7) Seguridad de la información</h2>
								<ul>
									<li>
										Sitio protegido con <strong>cifrado SSL/TLS</strong>.
									</li>
									<li>
										Controles de acceso, contraseñas cifradas y prácticas de
										minimización de datos.
									</li>
									<li>
										Pagos procesados por{' '}
										<strong>proveedores certificados</strong>; {storeName} no
										almacena PAN completo de tarjetas.
									</li>
								</ul>
							</section>

							<section id='cookies'>
								<h2>8) Cookies y tecnologías similares</h2>
								<p>
									Usamos cookies propias y de terceros para funciones esenciales
									(carrito/checkout) y, con su consentimiento, para analítica y
									marketing. Puede administrar o retirar su consentimiento desde
									el banner de cookies o configurando su navegador para
									bloquear/eliminar cookies. Si deshabilita ciertas cookies,
									algunas funciones podrían no operar correctamente.
								</p>
							</section>

							<section id='menores'>
								<h2>9) Menores de edad</h2>
								<p>
									Nuestros productos están dirigidos a mayores de edad. No
									recabamos intencionalmente datos de menores. Si eres
									padre/madre/tutor y consideras que un menor nos proporcionó
									datos, contáctanos para atender la solicitud correspondiente.
								</p>
							</section>

							<section id='arco'>
								<h2>10) Derechos ARCO y revocación</h2>
								<p>
									Puede ejercer sus derechos de{' '}
									<strong>
										Acceso, Rectificación, Cancelación y Oposición (ARCO)
									</strong>
									, así como <strong>revocar</strong> su consentimiento,
									enviando una solicitud a{' '}
									<a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
								</p>
								<p>
									<strong>Requisitos mínimos de la solicitud:</strong>
								</p>
								<ul>
									<li>
										Nombre completo y medio para comunicarle la respuesta
										(correo o domicilio).
									</li>
									<li>
										Copia de identificación oficial (y, en su caso, del
										representante con carta poder).
									</li>
									<li>
										Descripción clara del derecho a ejercer y de los datos
										involucrados; para rectificación, anexar la documentación
										que soporte el cambio.
									</li>
								</ul>
								<p>
									<strong>Plazos:</strong> Responderemos en un máximo de{' '}
									<strong>20 días hábiles</strong> contados desde la recepción
									de la solicitud completa. De resultar procedente, haremos
									efectivo el derecho dentro de los{' '}
									<strong>15 días hábiles</strong> siguientes a la respuesta.
								</p>
							</section>

							<section id='limitacion'>
								<h2>11) Medios para limitar el uso o divulgación</h2>
								<ul>
									<li>
										Solicitar inclusión en listas internas de exclusión (no
										marketing) vía{' '}
										<a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
									</li>
									<li>
										Inscribirse en el{' '}
										<strong>
											Registro Público para Evitar Publicidad (REPEP)
										</strong>{' '}
										de PROFECO.
									</li>
									<li>
										Usar enlaces de <strong>cancelación de suscripción</strong>{' '}
										incluidos en nuestros correos promocionales.
									</li>
								</ul>
							</section>

							<section id='cambios'>
								<h2>12) Cambios al aviso</h2>
								<p>
									Podemos actualizar este Aviso para reflejar cambios legales u
									operativos. Publicaremos la versión vigente en esta página e
									indicaremos la fecha de actualización.
								</p>
							</section>

							<section id='contacto'>
								<h2>13) Contacto del responsable</h2>
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
								<p>
									Documentos relacionados:{' '}
									<a href='/politicas-de-envios'>Política de Envíos</a> ·{' '}
									<a href='/politicas-de-devolucion'>
										Política de Devoluciones
									</a>{' '}
									· <a href='/terminos-de-servicio'>Términos del Servicio</a>
								</p>
							</section>
						</article>
					</div>
				</div>
			</div>

			<Footer />

			{/* ---- STYLES (idénticos a Devoluciones) ---- */}
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

export default PoliticaDePrivacidad;
