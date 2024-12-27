import React, { useRef, useState, useEffect } from 'react';
const ToggleButon = ({
	tchecked,
	tonChange,
	tname,
	tdisabled,
	tcontent,
	style = 'checkbox',
}) => {
	const refToggle = useRef();
	const [isCheked, setIsCheked] = useState(tchecked);

	const handleCheck = () => {
		tonChange({
			target: {
				name: refToggle.current.name,
				checked: !isCheked,
			},
		});
		setIsCheked(!isCheked);
	};

	useEffect(() => {
		setIsCheked(tchecked);
	}, [tchecked]);

	return (
		<div className='toggle__container'>
			<div className='toogle'>
				<label className='switch'>
					<input
						type='checkbox'
						checked={isCheked}
						name={tname}
						onChange={handleCheck}
						disabled={tdisabled}
						className={style}
						ref={refToggle}
					/>

					<div className='slider'></div>
				</label>
			</div>
			<div
				className='toggle__label'
				onClick={() => !tdisabled && handleCheck()}
			>
				{tcontent}
			</div>
			<style jsx>
				{`
					.toggle__label {
						flex: 0 0 85%;
						width: 100%;
						cursor: pointer;
					}

					.toggle__container {
						display: flex;
						height: 28px;
						align-items: center;
					}

					.toggle {
						height: 100%;
						width: 100%;
						display: flex;
						align-items: center;
						position: relative;
					}

					.switch {
						position: relative;
						display: inline-block;
						width: 30px;
						height: 18px;
						outline: none;
						margin-right: 10px;
						cursor: pointer;
						margin-top: 3px;
					}
					.switch .checkbox {
						display: none;
						outline: none;
					}

					.slider {
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						width: 100%;
						border: 0;
						position: absolute;
						background-color: #eaeaea;
						-webkit-transition: 0.4s;
						transition: 0.4s;
						border-radius: 34px;
						outline: none;
					}
					.slider:before {
						position: absolute;
						content: '';
						height: 14px;
						width: 14px;
						left: 4px;
						bottom: 2px;
						background-color: white;
						-webkit-transition: 0.4s;
						transition: 0.4s;
						border-radius: 50%;
					}
					.checkbox:checked + .slider {
						background-color: var(--primary-color);
					}
					.checkbox:focus + .slider {
						box-shadow: 0 0 1pxvar (--primary-color);
					}
					.checkbox:checked + .slider:before {
						-webkit-transform: translateX(8px);
						-ms-transform: translateX(8px);
						transform: translateX(8px);
					}
					.checkbox:disabled + .slider {
						background-color: #eaeaea;
					}

					.green:checked + .slider,
					.checkbox:focus + .slider {
						background-color: #00b517 !important;
						box-shadow: 0 0 1px #00b517;
					}
				`}
			</style>
		</div>
	);
};

export default React.memo(ToggleButon);
