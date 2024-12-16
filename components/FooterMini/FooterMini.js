import React from 'react';

const FooterMini = () => {
	return (
		<aside className='footer__aside'>
			© 2024 PCStore.mx - PCSTORE ONLINE SAS DE CV - Hecho en Puebla, Puebla con
			❤️
			<style jsx>
				{`
					.footer__aside {
						display: flex;
						justify-content: center;
						line-height: 2;
						text-align: center;
						padding: 10px;
						margin-bottom: 20px;
					}
				`}
			</style>
		</aside>
	);
};

export default FooterMini;
