import React from 'react';

interface OpacityContainerProps {
	opacityContainer: { opacity: number, visibility: string };
	setParentOpacity: (state: boolean) => void;
}

const OpacityContainer: React.FC<OpacityContainerProps> = ({
	opacityContainer,
	setParentOpacity,
}) => {
	return (
		<div>
			<div
				className='opacity'
				style={opacityContainer}
				onClick={() => setParentOpacity(false)}
			></div>
			<style jsx>
				{`
					.opacity {
						opacity: 0;
						visibility: hidden;
						top: 0;
						width: 100%;
						height: 100%;
						background: #0f0f0f;
						position: fixed;
						transition: opacity 0.3s, visibility 0.3s;
						z-index: 50;
					}
				`}
			</style>
		</div>
	);
};

export default OpacityContainer;
