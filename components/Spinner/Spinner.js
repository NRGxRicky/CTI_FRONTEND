import React from 'react';

const Spinner = ({ size = 30, strokeWidth = 3, className = '' }) => {
  return (
    <div className={`spinner-container ${className}`}>
      <div className="spinner" style={{ width: size, height: size }}>
        <svg
          className="spinner-svg"
          viewBox="0 0 50 50"
          width={size}
          height={size}
        >
          <circle
            className="spinner-circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>

      <style jsx>{`
				.spinner-container {
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.spinner {
					animation: rotate 2s linear infinite;
				}

				.spinner-svg {
					animation: rotate 2s linear infinite;
				}

				.spinner-circle {
					stroke: var(--primary-color);
					stroke-linecap: round;
					stroke-dasharray: 90, 150;
					stroke-dashoffset: 0;
					animation: dash 1.5s ease-in-out infinite;
				}

				@keyframes rotate {
					100% {
						transform: rotate(360deg);
					}
				}

				@keyframes dash {
					0% {
						stroke-dasharray: 1, 150;
						stroke-dashoffset: 0;
					}
					50% {
						stroke-dasharray: 90, 150;
						stroke-dashoffset: -35;
					}
					100% {
						stroke-dasharray: 90, 150;
						stroke-dashoffset: -124;
					}
				}
			`}</style>
    </div>
  );
};

export default Spinner; 