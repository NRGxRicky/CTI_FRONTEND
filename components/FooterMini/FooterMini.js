import React from 'react';
import { useEnv } from '../../context/EnvContext';

const FooterMini = () => {

	const { storeName, legalName, emojiFooter } = useEnv();
	return (
		<aside className='footer__aside'>
			© 2025 {storeName} - {legalName} - Hecho en Puebla, Puebla con{' '}
			{emojiFooter}
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
