import React from 'react';

const InfoPageFooter = () => {
  return (
		<div className='footer-info__container'>
			<div className='footer-info__container__text'>
				<p>
					<b>PCStore.mx</b>
				</p>
				<p>
					<b> Tu tienda de tecnología en México </b>
				</p>
				<p>
					Somos una tienda de tecnología en línea que ofrece una amplia variedad
					de productos y servicios para satisfacer las necesidades de nuestros
					clientes. Contamos con más de 5,000 artículos disponibles, incluyendo
					computadoras, laptops, tabletas, teléfonos celulares, accesorios, y
					mucho más.
				</p>
				<p>
					Nuestros productos son de la más alta calidad y están respaldados por
					nuestra garantía de satisfacción. Contamos con un centro de
					distribución local para garantizar que nuestros clientes reciban sus
					pedidos de manera rápida y eficiente.
				</p>
				<p>
					Nuestro equipo de atención al cliente está disponible para ayudarte
					24/7. Estamos comprometidos a brindarte un servicio excelente y una
					experiencia de compra positiva.
				</p>
				<p>¡Bienvenido a PCStore.mx!</p>
			</div>
			<style jsx>
				{`
        .footer-info__container {
        width: 100%;
        padding: 20px;
        background-color: #ffffff;
        font-size: 15px;
        }
        
        .footer-info__container p {
          margin-bottom: 15px;
          line-height: 30px;
        }
        `}
			</style>
		</div>
	);
};

export default InfoPageFooter;