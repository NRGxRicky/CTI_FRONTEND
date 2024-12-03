import React from 'react';
import Footer from '../components/Footer/Footer';
import Head from 'next/head';

const PoliticasDeEnvios = () => {
	return (
		<div>
			<Head>
				<title>
					Políticas de Envíos | PCStore.mx: Tu tienda en Tecnología, Cómputo,
					Accesorios
				</title>
				<meta
					name='description'
					content={`PCStore.mx Tienda líder en cómputo, accesorios, hardware, tecnología y más. Compra protegida, envíos asegurados y pagos seguros con los mejores precios, productos y marcas.`}
				/>
			</Head>
			<div className='container'>
				<div className='policy__container'>
					<div className='policy__title'>
						<h1>Políticas de Envíos</h1>
					</div>
					<div className='policy__body'>
						<div className='policy__content'>
							<p>
								En pcstore.mx, estamos comprometidos a brindarte un servicio de
								envío confiable y eficiente. A continuación, se detallan
								nuestras políticas generales de envío para garantizar una
								experiencia de compra satisfactoria:
							</p>
							<br />
							<p>
								<strong>1. Cobertura Geográfica</strong>
							</p>
							<ul>
								<li>
									Todos nuestros productos pueden ser enviados dentro de la
									República Mexicana, siempre y cuando haya acceso y cobertura
									por parte de las paqueterías y/o proveedores de servicios de
									mensajería.
								</li>
							</ul>
							<br />
							<p>
								<strong>2. Datos de Envío</strong>
							</p>
							<ul>
								<li>
									El comprador/cliente debe proporcionar un domicilio real y
									completo, que incluya los siguientes datos:
									<ul>
										<li>Calle</li>
										<li>Número (si aplica)</li>
										<li>Número interior (si aplica)</li>
										<li>Colonia</li>
										<li>Código Postal</li>
										<li>Ciudad</li>
										<li>Estado</li>
										<li>Teléfono de contacto</li>
										<li>Nombre de la persona que recibirá el paquete</li>
									</ul>
								</li>
							</ul>
							<br />
							<p>
								<strong>3. Información Adicional (Opcional)</strong>
							</p>
							<ul>
								<li>
									En el campo de observaciones, sugerimos agregar referencias
									adicionales sobre su domicilio o indicaciones entre calles
									para facilitar la entrega.
								</li>
							</ul>
							<br />
							<p>
								<strong>4. Verificación de Datos</strong>
							</p>
							<ul>
								<li>
									Es esencial que los datos proporcionados sean correctos y
									completos. Si la información de envío es incorrecta o está
									incompleta, no podremos procesar su pedido y le notificaremos
									el motivo.
								</li>
							</ul>
							<br />
							<p>
								<strong>5. Reenvío por Domicilio Incorrecto</strong>
							</p>
							<ul>
								<li>
									En caso de que su pedido no pueda ser entregado debido a un
									"Domicilio Incorrecto" y sea devuelto a nosotros por parte de
									las paqueterías, deberá pagar nuevamente el costo de envío
									para que podamos reenviar el pedido a la dirección correcta.
								</li>
							</ul>
							<br />
							<p>
								<strong>6. Tiempo de Procesamiento</strong>
							</p>
							<ul>
								<li>
									Los pedidos pueden tardar hasta 24 horas en días hábiles para
									su procesamiento. Durante este tiempo, verificamos la
									información de envío, preparamos los pedidos y los embalamos
									adecuadamente. Una vez completado este proceso, le
									proporcionaremos el número de guía y la empresa de mensajería
									correspondiente.
								</li>
							</ul>
							<br />
							<p>
								<strong>7. Inspección del Paquete</strong>
							</p>
							<ul>
								<li>
									Antes de recibir su paquete, le recomendamos que lo
									inspeccione cuidadosamente para asegurarse de que esté
									debidamente sellado y no presente daños físicos, golpes,
									humedad, aberturas o modificaciones. Si observa algún detalle
									preocupante, le sugerimos no aceptar el paquete de la empresa
									de mensajería y notificarnos de inmediato.
								</li>
							</ul>
							<br />
							<p>
								<strong>
									Para cualquier duda o consulta adicional, no dude en ponerse
									en contacto con nosotros:
								</strong>
							</p>
							<ul>
								<li>
									Correo electrónico:{' '}
									<a
										data-sanitized-target='_new'
										href='mailto:contacto@pcstore.mx'
									>
										contacto@pcstore.mx
									</a>
								</li>
								<li>
									Teléfono:{' '}
									<a
										data-encoded-tag-name='meta'
										data-encoded-tag-value=''
										data-encoded-attr-charset='dXRmLTg='
									></a>
									<span>22 28 29 83 51</span>
								</li>
							</ul>
							<br />
							<p>
								En pcstore.mx, trabajamos constantemente para garantizar que su
								experiencia de compra y envío sea segura y satisfactoria.
								Agradecemos su confianza en nosotros como su proveedor de
								productos y servicios tecnológicos.
							</p>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default PoliticasDeEnvios;
