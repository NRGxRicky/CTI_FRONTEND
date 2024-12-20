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
		} = useEnv();
	return (
		<div>
			<Head>
				<title>
					{`Código de Ética | ${storeName}: ${titlePostDescription}`}
				</title>
				<meta name='description' content={`${metaDescription}`} />
			</Head>
			<div className='container'>
				<div className='policy__container'>
					<div className='policy__title'>
						<h1>Código de Ética {storeName.toUpperCase()}</h1>
					</div>
					<div className='policy__body'>
						<div className='policy__content'>
							<p>&nbsp;</p>
							<p>
								<span>
									<b>CÓDIGO DE ÉTICA EN MATERIA DE COMERCIO ELECTRÓNICO</b>
								</span>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<span>
									<b>Capítulo I. Disposiciones Generales</b>
								</span>
							</p>
							<p>&nbsp;</p>
							<p>
								<strong>Artículo 1. Objeto</strong>
							</p>
							<p>&nbsp;</p>
							<p>
								Este Código de Ética en materia de Comercio Electrónico
								establece los valores y principios que {storeName.toUpperCase()}
								, representada legalmente por {legalName}, deberá observar en
								las actividades relacionadas con el comercio electrónico
								realizadas en sus plataformas{' '}
								<a href={pageUrl} target='_new'>
									{pageUrl}
								</a>
								, a fin de respetar y promover los derechos del consumidor,
								fomentar una cultura de consumo responsable, la promoción de los
								derechos humanos de los consumidores, la publicidad digital
								ética y responsable, la protección de grupos vulnerables y la
								autorregulación.
							</p>
							<p>
								En este Código de Ética en materia de Comercio Electrónico se
								establecen los estándares mínimos, de manera enunciativa más no
								limitativa, tanto de las actividades comerciales que se realicen
								en medios electrónicos digitales, así como de los mecanismos de
								verificación de cumplimiento.
							</p>
							<p>&nbsp;</p>
							<p>
								<strong>Artículo 2. Ámbito de Aplicación</strong>
							</p>
							<p>&nbsp;</p>
							<p>
								El Código de Ética en materia de Comercio Electrónico es de
								adopción voluntaria y aplicable a {storeName.toUpperCase()},
								representada legalmente por {legalName}, en las transacciones,
								efectuadas a través del uso de medios electrónicos digitales en
								el territorio nacional. {storeName.toUpperCase()}, representada
								legalmente por {legalName}, se compromete a respetar que en
								todas sus actividades de comercio electrónico se cumplan los
								principios establecidos en el presente Código. El presente
								Código de Ética en materia de Comercio Electrónico no será
								aplicable a las incidencias o fallas técnicas derivadas que se
								susciten por caso fortuito o fuerza mayor.
							</p>
							<p>
								De la misma forma, este Código no será aplicable para los
								proveedores de servicios financieros.
								<br />
								<br />
							</p>
							<p>&nbsp;</p>
							<p>
								<b>Artículo 3. Definiciones</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Para efectos del presente Código de Ética en materia de Comercio
								Electrónico, se entenderá por:
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Adolescentes: Son adolescentes las personas de entre doce años
								cumplidos y menos de dieciocho años de edad;
							</p>
							<p>
								Código: El Código de Ética en materia de Comercio Electrónico;
							</p>
							<p>
								Comercio Electrónico: Toda transacción económica que implica el
								ofrecimiento, comercialización o venta, de bienes, productos o
								servicios utilizando medios electrónicos digitales, ópticos o de
								cualquier otra tecnología a través de un sistema de información
								digital;
							</p>
							<p>
								Consumidor: La persona física o moral que adquiere, realiza o
								disfruta como destinatario final los bienes, productos o Se
								entiende también por Consumidor a la persona física o moral que
								adquiera, almacene, utilice o consuma bienes o servicios con
								objeto de integrarlos en procesos de producción, transformación,
								comercialización o prestación de servicios a terceros,
								únicamente para los casos a que se refieren los artículos 99 y
								117 de la Ley Federal de Protección al Consumidor;
							</p>
							<p>
								Datos Personales: Cualquier información concerniente a una
								persona física identificada o Se considera que una persona es
								identificable cuando su identidad pueda determinarse directa o
								indirectamente a través de cualquier información;
							</p>
							<p>
								Niñas, niños y adolescentes: Son niñas y niños los menores de
								doce años, y adolescentes las personas de entre doce años
								cumplidos y menos de dieciocho años de Para efectos de los
								tratados internacionales y la mayoría de edad, son niños los
								menores de dieciocho años de edad;
							</p>
							<p>
								Proveedor: {storeName.toUpperCase()} en este Código referido
								como {storeName.toUpperCase()}; Publicidad: Cualquier forma de
								comunicación comercial realizada por un proveedor, que comprende
								todo proceso de creación, planificación, ejecución y difusión o
								transmisión de mensajes publicitarios con el fin de promover la
								venta o consumo de bienes, productos o servicios;
							</p>
							<p>Plataforma de comercio electrónico: {contactEmail}</p>
							<p>
								Tienda virtual: Es un espacio dentro de un sitio web, en el que
								se ofrecen artículos a la venta.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<span>
									<b>Capítulo II. Comercio Electrónico</b>
								</span>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>
									Artículo 4. Normativa Constitucional, Convencional y Legal
								</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} actúa de conformidad con lo aplicable
								y establecido en la Constitución Política de los Estados Unidos
								Mexicanos y los tratados internacionales de derechos humanos de
								los que México sea parte, así como con la Ley Federal de
								Protección al Consumidor, además de guiarse por la Norma
								Mexicana de Comercio Electrónico (NMX-COE-001-SCFI-2018).
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Tendrán en todo momento la disposición para adherirse y cumplir
								obligatoriamente con lo estipulado en lo establecido en el
								presente Código a fin de conducirse con respeto y ética a las
								normas que rigen el desarrollo de sus actividades
								particularmente aquellas que supongan conflicto que se generen
								con los consumidores.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>
									Artículo 5. Disponibilidad y colaboración con las autoridades
								</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} tendrá la disposición de colaborar
								cuando los consumidores se vean afectados. Serán responsables
								por los servicios que ofrezcan, con el alcance especificado en
								sus términos y condiciones, los cuales deben ser claros,
								precisos y fácilmente accesibles.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>
									Artículo 6. Mecanismos de identidad, pago y envío o entrega
								</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} en sus plataformas de comercio
								electrónico pone a disposición de los consumidores al menos lo
								siguiente:
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Nombre comercial, marca, denominación o razón social, domicilio
								físico en territorio nacional, Registro Federal de
								Contribuyentes y números telefónicos, u otros medios de
								contacto;
							</p>
							<p>
								Información sobre el procedimiento para la adquisición del bien,
								producto o servicio, señalando los apartados donde puede
								encontrar características y restricciones de los mismos;
							</p>
							<p>
								Información al consumidor de su derecho a revocar su
								consentimiento respecto la transacción celebrada, sin
								responsabilidad ni justificación alguna;
							</p>
							<p>
								Mecanismos de devolución, reposición o cambio de los bienes,
								productos o servicios;
							</p>
							<p>
								Cuando ofrezcan garantías debe informar sobre el plazo de las
								mismas, el cual no puede ser menor al previsto en la Ley o las
								disposiciones jurídicas aplicables, así como las restricciones
								aplicables;
							</p>
							<p>
								Mecanismos de solución para las reclamaciones o aclaraciones,
								incluyendo los días y horarios de atención;
							</p>
							<p>
								Dar a conocer las restricciones de edad para hacer uso de la
								tienda virtual o plataforma de comercio electrónico;
							</p>
							<p>El tratamiento que le dará a sus datos personales;</p>
							<p>
								Términos y condiciones a que estarán sujetas las transacciones;
							</p>
							<p>
								Métodos de pago y facturación fáciles de usar, implementando
								medidas de seguridad proporcionales a los riesgos relacionados
								con los pagos, incluyendo los que derivan del acceso o el uso no
								autorizado de datos personales, prácticas comerciales engañosas
								y el robo de identidad;
							</p>
							<p>
								Costos totales en moneda nacional, incluyendo IVA, impuestos
								transfronterizos, costo de envío;
							</p>
							<p>
								Comprobante de la transacción comercial, el cual deberá ser
								facilitado al consumidor por el mismo medio en que se celebró la
								transacción;
							</p>
							<p>
								Los medios para obtener el comprobante fiscal o el comprobante
								de la transacción comercial y, en su caso, el procedimiento para
								solicitar la corrección de los mismos, cuando sea procedente y,
							</p>
							<p>
								La forma de entrega incluyendo los costos, plazos y opciones de
								envío.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>Artículo 7. Términos y condiciones</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Los términos y condiciones estarán en idioma español y dentro de
								nuestras páginas {pageUrl} en un lugar visible y de fácil acceso
								para el Consumidor.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Los términos y condiciones serán aplicables en todas las compras
								y servicios que se contraten en el portal electrónico {pageUrl}.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Nuestras plataformas de comercio electrónico podrán dar acceso a
								hipervínculos cuya finalidad sea facilitar el acceso, archivo e
								impresión de la información a fin de mejorar la experiencia y
								otorgar certeza al consumidor al utilizar el sitio.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								La aplicación de los términos y condiciones se sujetará a lo
								establecido en la Ley Federal de Protección al Consumidor. En
								consecuencia, el Consumidor gozará de todos los derechos
								reconocidos en la Ley, además de los que se le otorguen en esos
								términos y condiciones. Todos los derechos, deberes, beneficios
								y garantías contenidos en Ley Federal de Protección al
								Consumidor deben ser reconocidos y aplicados estrictamente por{' '}
								{storeName.toUpperCase()}
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Los términos y condiciones contendrán al menos la siguiente
								información:
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Los términos y condiciones contendrán al menos la siguiente
								información:
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								I. Condiciones generales o particulares de contratación
								aplicables en cada caso;
							</p>
							<p>II. Plazo de vigencia de ofertas y promociones;</p>
							<p>
								III. Restricciones de pago o entrega, condiciones necesarias
								para la utilización o entrega y penalidades por cancelación;
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} proporcionará al consumidor la
								información adecuada y clara sobre los diferentes bienes,
								productos o servicios, pudiendo utilizar imágenes, audio y
								video, o cualquier otra herramienta que considere apropiada.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<span>
									<b>Capítulo III. Publicidad Digital</b>
								</span>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>Artículo 8. Principio de legalidad</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								La publicidad digital que maneja {storeName.toUpperCase()} es
								veraz, comprobable, clara y exenta de textos, diálogos, sonidos,
								imágenes, marcas, denominaciones de origen y otras descripciones
								que induzcan o puedan inducir a error o confusión por engañosas
								o abusivas. Asimismo, se apega a la normatividad aplicable y, de
								manera especial, respetar los derechos, obligaciones y
								principios reconocidos por La Ley Federal de Protección al
								Consumidor.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>Artículo 9. Publicidad digital responsable</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								La publicidad que se desarrolle como estrategia de comercio
								electrónico de {storeName.toUpperCase()} deberán:
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>a) Ser identificable adecuadamente como tal;</p>
							<p>
								b) Contener la identidad del anunciante y los datos de contacto;
							</p>
							<p>
								c) La tienda virtual o plataforma de comercio electrónico deberá
								contar con un mecanismo que permita al consumidor elegir si
								desea dejar de recibir publicidad comercial directa;
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<span>
									<b>Capítulo IV. Protección de datos</b>
								</span>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>Artículo 10. Principios generales</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} se apegan a lo establecido en el
								Artículo 16 Constitucional, el cual reconoce el derecho que toda
								persona tiene a la protección de sus datos personales, el
								acceso, rectificación y cancelación de los mismos, así como a
								manifestar su oposición en los términos que fije la normatividad
								aplicable. En este sentido, {storeName.toUpperCase()} cuentan
								con un Aviso de privacidad, como mecanismo accesible, seguro,
								fácil de entender, con un lenguaje sencillo y claro que permita
								al Consumidor acceder a toda la información inherente al
								tratamiento y protección que se dará a sus datos personales.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} incluyen en su plataforma, y en todo
								el proceso de compra, leyendas de advertencia para que las
								niñas, niños y adolescentes se abstengan de facilitar sus datos
								personales, sin la autorización de sus padres o tutores, para
								que la compra se realice directamente por estos últimos.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Asimismo, {storeName.toUpperCase()} están obligados a verificar
								lo siguiente:
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Deberá identificar los contenidos dirigidos únicamente a
								adultos;
							</p>
							<p>
								No deberá incitar directamente a las niñas, niños y adolescentes
								a la compra de un bien, producto o servicio, aprovechando su
								inexperiencia o su credulidad, ni a que persuadan a sus padres o
								tutores, o a los padres o tutores de terceros, para que compren
								los productos o servicios de que se trate;
							</p>
							<p>
								No deberá, sin motivo justificado, exponer a las niñas, niños y
								adolescentes en situaciones peligrosas;
							</p>
							<p>
								No publicarán en sus sitios web contenidos, declaraciones o
								presentaciones visuales ilícitas o que pudieran producir
								perjuicio mental, moral o físico a las niñas, niños y
								adolescentes;
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<span>
									<b>Capítulo V. Derechos Humanos</b>
								</span>
							</p>

							<p>
								<br />
								<br />
							</p>
							<p>
								<b>Artículo 11. Grupos vulnerables</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} adquiere un compromiso con el respeto
								y protección de los derechos de personas adultas mayores, niñas,
								niños y adolescentes, personas con discapacidad e indígenas, así
								como otras personas sujetas a discriminación, solucionando de
								manera ágil sus conflictos o dudas y cuidando que la publicidad
								que se dirija a ellos o la a que pudieran tener acceso fomente
								el respeto a la dignidad, equidad, seguridad e inclusión.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<span>
									<b>Capítulo VI. Solución de Conflictos</b>
								</span>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>
									Artículo 12. Autorregulación y medios propios para solucionar
									conflictos
								</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} cuenta con mecanismos propios para
								solucionar los conflictos con los consumidores cuando exista
								algún incumplimiento a las obligaciones que se establecen en la
								Ley Federal de Protección al Consumidor, en la Norma Mexicana de
								Comercio Electrónico (NMX-COE-001-SCFI-2018) en este Código.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Se reconoce a la autorregulación como un mecanismo confiable,
								imparcial, eficiente y seguro para la solución de conflictos
								relacionados con actividades o prácticas comerciales que se
								lleven a cabo a través de medios electrónicos digitales.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>
									Artículo 13. Medios Alternativos de Solución de Conflictos
								</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} procurarán solventar las disputas con
								los consumidores a través de medios alternativos de solución de
								conflictos. La mediación, conciliación y arbitraje serán
								primordiales para llegar a acuerdos rápidos, mecanismo que se
								encuentra descrito en el punto 7. Normatividad y políticas
								aplicables en caso de controversia del Contrato Adhesión
								{storeName.toUpperCase()} Tienda en Línea o mediante los
								procedimientos establecidos por la Procuraduría Federal del
								Consumidor.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>
									Artículo 14. Vinculación con la Procuraduría Federal del
									Consumidor
								</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} cumplirá con lo estipulado en la Ley
								Federal de Protección al Consumidor y actuarán diligentemente en
								los procedimientos conciliatorios para llegar a acuerdos con el
								propósito de beneficiar a los consumidores.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>Artículo 15. Vigilancia y Cumplimiento del Código</b>
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								{storeName.toUpperCase()} cuenta con mecanismos propios para
								vigilar el cumplimiento de este código de ética, así como
								procedimientos de seguimiento ante su incumplimiento a través de
								los siguientes medios:
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								Quejas y protocolos de atención a través del departamento de
								Atención a Cliente en los siguientes números y correos de
								contacto:
							</p>
							<p>
								Email: {contactEmail}
								<br />
								Teléfono: <span>{phone}</span>.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<b>Artículo 16. Compromiso de cumplimiento del Código</b>
							</p>
							<br />
							<br />
							<p>
								{storeName.toUpperCase()} manifiesta su adhesión al presente
								Código por lo que se comprometen a respetarlo y cumplirlo en
								materia de comercio electrónico, publicidad, protección de datos
								y derechos humanos. De no cumplir con este Código, se solicitará
								la cancelación a su adhesión.
							</p>
							<p>
								<br />
								<br />
							</p>
							<p>
								<br />
								<br />
							</p>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default CodigoDeEtica;
