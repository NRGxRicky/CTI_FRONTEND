import React from 'react';

const IconWhatsapp = () => {
  return (
		<div>
			<div
				style={{
					position: 'fixed',
					right: '10px',
					bottom: '10px',
					'text-align': 'center',
					padding: '3px',
				}}
			>
				<a
					href='https://wa.me/+5212229616956'
					target='_blank'
					rel='noopener noreferrer'
				>
					<img
						src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/240px-WhatsApp.svg.png'
						width='50'
						height='50'
					/>
				</a>
			</div>
		</div>
	);
};

export default IconWhatsapp;