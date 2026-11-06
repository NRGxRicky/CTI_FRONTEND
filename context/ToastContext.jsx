import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

let globalShowToast = null;

export const toast = {
	success: (msg, duration) => globalShowToast?.(msg, 'success', duration),
	error: (msg, duration) => globalShowToast?.(msg, 'error', duration),
	warning: (msg, duration) => globalShowToast?.(msg, 'warning', duration),
	info: (msg, duration) => globalShowToast?.(msg, 'info', duration),
};

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const showToast = useCallback((message, type = 'info', duration = 4000) => {
		const id = Date.now() + Math.random().toString(36).substring(2, 9);
		setToasts((prev) => [...prev, { id, message, type }]);

		if (duration > 0) {
			setTimeout(() => {
				removeToast(id);
			}, duration);
		}
	}, [removeToast]);

	useEffect(() => {
		globalShowToast = showToast;
		return () => {
			globalShowToast = null;
		};
	}, [showToast]);

	return (
		<ToastContext.Provider value={{ showToast, removeToast }}>
			{children}
			<div className='toast-portal-container'>
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`toast-notification toast-${t.type}`}
						onClick={() => removeToast(t.id)}
					>
						<div className='toast-icon'>
							{t.type === 'success' && '✓'}
							{t.type === 'error' && '✕'}
							{t.type === 'warning' && '⚠'}
							{t.type === 'info' && 'ℹ'}
						</div>
						<div className='toast-message'>{t.message}</div>
						<button
							className='toast-close'
							aria-label='Cerrar notificación'
							onClick={(e) => {
								e.stopPropagation();
								removeToast(t.id);
							}}
						>
							×
						</button>
					</div>
				))}
			</div>
			<style jsx>{`
				.toast-portal-container {
					position: fixed;
					top: 24px;
					right: 24px;
					z-index: 999999;
					display: flex;
					flex-direction: column;
					gap: 12px;
					max-width: 90vw;
					width: 380px;
					pointer-events: none;
				}

				.toast-notification {
					pointer-events: auto;
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 14px 16px;
					border-radius: 8px;
					background: #ffffff;
					box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08);
					font-size: 14px;
					line-height: 1.4;
					font-weight: 500;
					color: #1f2937;
					border-left: 5px solid #2349f1;
					cursor: pointer;
					animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
				}

				@keyframes toastSlideIn {
					from {
						transform: translateY(-20px);
						opacity: 0;
					}
					to {
						transform: translateY(0);
						opacity: 1;
					}
				}

				.toast-success {
					border-left-color: #10b981;
				}
				.toast-success .toast-icon {
					color: #10b981;
					background: #ecfdf5;
				}

				.toast-error {
					border-left-color: #ef4444;
				}
				.toast-error .toast-icon {
					color: #ef4444;
					background: #fef2f2;
				}

				.toast-warning {
					border-left-color: #f59e0b;
				}
				.toast-warning .toast-icon {
					color: #f59e0b;
					background: #fffbeb;
				}

				.toast-info {
					border-left-color: #2349f1;
				}
				.toast-info .toast-icon {
					color: #2349f1;
					background: #eff6ff;
				}

				.toast-icon {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 28px;
					height: 28px;
					border-radius: 50%;
					font-weight: 700;
					font-size: 14px;
					flex-shrink: 0;
				}

				.toast-message {
					flex: 1;
					word-break: break-word;
				}

				.toast-close {
					background: transparent;
					border: none;
					font-size: 20px;
					color: #9ca3af;
					cursor: pointer;
					padding: 0 4px;
					line-height: 1;
				}
				.toast-close:hover {
					color: #374151;
				}

				@media only screen and (max-width: 48em) {
					.toast-portal-container {
						top: 16px;
						right: 5%;
						left: 5%;
						width: 90%;
					}
				}
			`}</style>
		</ToastContext.Provider>
	);
};

export const useToast = () => useContext(ToastContext);
