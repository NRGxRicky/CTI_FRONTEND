import React from 'react';
import Link from 'next/link';

const StatusBarCart = ({ steps = [], activeStep = 'cart' }) => {
	return (
		<div className='status-bar'>
			{steps.map((step, index) => {
				const isActive = steps.findIndex((s) => s.key === activeStep) >= index;
				return (
					<div
						key={step.key}
						className={`status-step ${
							activeStep === step.key ? 'actived' : ''
						} ${isActive ? 'active' : ''}`}
					>
						{isActive ? (
							<Link href={step.link || '#'} legacyBehavior>
								<a className='step-link'>{step.label}</a>
							</Link>
						) : (
							<p>{step.label}</p>
						)}
						{index < steps.length - 1 && <div className='line'></div>}
					</div>
				);
			})}
			<style jsx>{`
				.status-bar {
					display: flex;
					justify-content: space-between;
					margin-bottom: 20px;
					background: #f0f0f0;
					border-radius: 2px;
					padding: 10px 5px;
					font-size: 12px;
				}

				.status-step {
					display: flex;
					flex-direction: column;
					align-items: center;
					flex: 1;
					color: #aaa;
					position: relative;
					padding: 0 2px;
				}

				.status-step.active {
					color: #474747;
				}

				.status-step.actived {
					color: #ff002c;
				}

				.status-step .line {
					position: relative;
					height: 4px;
					width: 100%;
					background: #aaa;
					margin: 5px 0;
					border-radius: 1px;
				}

				.status-step.active .line {
					background: #ff002c;
				}

				.step-link {
					color: inherit;
					text-decoration: none;
					cursor: pointer;
				}

				.step-link:hover {
					text-decoration: underline;
				}
			`}</style>
		</div>
	);
};

export default StatusBarCart;
