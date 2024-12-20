import React from 'react';
import { useEnv } from '../../context/EnvContext';

const IconWhatsapp = () => {
	const { phone } = useEnv();

	return (
		<div>
			<div
				style={{
					position: 'fixed',
					right: '10px',
					bottom: '10px',
					textAlign: 'center',
					padding: '3px',
				}}
			>
				<a
					href={`https://wa.me/+521${phone.replace(/\s+/g, '')}`}
					target='_blank'
					rel='noopener noreferrer'
				>
					<img
						src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/240px-WhatsApp.svg.png'
						width='50'
						height='50'
						alt='WhatsApp'
					/>
				</a>
			</div>
		</div>
	);
};

export default IconWhatsapp;
