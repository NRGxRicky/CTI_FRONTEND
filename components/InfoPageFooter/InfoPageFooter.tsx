import React from 'react';
import { useEnv } from '../../context/EnvContext';


const InfoPageFooter = () => {
	const { storeName, legalName, infoPageFooter } = useEnv();
	const preprocessedContent = infoPageFooter.replace(/<p>/g, '<p class="footer-paragraph">');
  return (
		<div className='footer-info__container'>
			<div
				className='footer-info__container__text'
				dangerouslySetInnerHTML={{ __html: preprocessedContent }}
			></div>

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