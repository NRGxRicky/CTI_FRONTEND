import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
	const [column1, setColumn1] = useState(false);
	const [column2, setColumn2] = useState(false);
	const [column3, setColumn3] = useState(false);
	const [column4, setColumn4] = useState(false);

	const showCurrentColumn = (integerColumn: number): void => {
		const columnStates = [column1, column2, column3, column4];
		const setStateFunction = [setColumn1, setColumn2, setColumn3, setColumn4];

		columnStates.forEach((state, index) => {
			setStateFunction[index](index + 1 === integerColumn ? !state : false);
		});
	};
	return (
		<div className='footer'>
			<div className='container'>
				<div className='footer__container'>
					<div className='footer__column'>
						<div
							className='footer__column__title'
							onClick={() => showCurrentColumn(1)}
						>
							INFORMACIÓN
							<button
								className={!column1 ? 'toggle-button active' : 'toggle-button'}
							></button>
						</div>
						<div
							className='footer__column__container'
							style={{ maxHeight: column1 ? '500px' : '0px' }}
						>
							<div className='footer__column__element'>
								<Link href={`politicas-de-devolucion`} legacyBehavior>
									<a>Políticas de Devolución</a>
								</Link>
							</div>
							<div className='footer__column__element'>
								<Link href={`terminos-de-servicio`} legacyBehavior>
									<a>Términos de Servicio</a>
								</Link>
							</div>
							<div className='footer__column__element'>
								<Link href={`aviso-de-privacidad`} legacyBehavior>
									<a>Aviso de Privacidad</a>
								</Link>
							</div>
							<div className='footer__column__element'>
								<Link href={`politicas-de-envios`} legacyBehavior>
									<a>Políticas de Envíos</a>
								</Link>
							</div>
							<div className='footer__column__element'>
								<Link href={`codigo-de-etica`} legacyBehavior>
									<a>Código de Ética</a>
								</Link>
							</div>
						</div>
					</div>
					<div className='footer__column'>
						<div
							className='footer__column__title'
							onClick={() => showCurrentColumn(2)}
						>
							CONTACTAR
							<button
								className={!column2 ? 'toggle-button active' : 'toggle-button'}
							></button>
						</div>
						<div
							className='footer__column__container'
							style={{ maxHeight: column2 ? '500px' : '0px' }}
						>
							<div className='footer__column__element'>
								<b>Telefono:</b> 22 28 29 83 51
							</div>
							<div className='footer__column__element'>
								<b>WhatsApp:</b>
								<a
									href='https://wa.me/+5212228298351'
									target='_blank'
									rel='noopener noreferrer'
								>
									{' '}
									22 28 29 83 51
								</a>
							</div>
							<div className='footer__column__element'>
								<b>Email:</b> contacto@pcstore.mx
							</div>
							<div className='footer__column__element'>
								<b>Horario:</b> Lunes a Viernes 9:00 am a 6:00 pm
							</div>
						</div>
					</div>
					<div className='footer__column'>
						<div
							className='footer__column__title'
							onClick={() => showCurrentColumn(3)}
						>
							SERVICIO A CLIENTES
							<button
								className={!column3 ? 'toggle-button active' : 'toggle-button'}
							></button>
						</div>
						<div
							className='footer__column__container'
							style={{ maxHeight: column3 ? '500px' : '0px' }}
						>
							<div className='footer__column__element'>Facturación</div>
						</div>
					</div>
					<div className='footer__column'>
						<div
							className='footer__column__title'
							onClick={() => showCurrentColumn(4)}
						>
							SÍGUENOS
							<button
								className={!column4 ? 'toggle-button active' : 'toggle-button'}
							></button>
						</div>
						<div
							className='footer__column__container'
							style={{ maxHeight: column4 ? '500px' : '0px' }}
						>
							<div className='footer__column__element facebook'>
								<a
									href='https://facebook.com/pcstoremxoficial'
									target='_blank'
									rel='noopener'
									aria-label='Síguenos en Facebook'
									aria-describedby='a11y-new-window-message'
									className='footer__social__icon'
								>
									<svg
										focusable='false'
										className='icon--facebook '
										viewBox='0 0 30 30'
									>
										<path
											d='M15 30C6.71572875 30 0 23.2842712 0 15 0 6.71572875 6.71572875 0 15 0c8.2842712 0 15 6.71572875 15 15 0 8.2842712-6.7157288 15-15 15zm3.2142857-17.1429611h-2.1428678v-2.1425646c0-.5852979.8203285-1.07160109 1.0714928-1.07160109h1.071375v-2.1428925h-2.1428678c-2.3564786 0-3.2142536 1.98610393-3.2142536 3.21449359v2.1425646h-1.0714822l.0032143 2.1528011 1.0682679-.0099086v7.499969h3.2142536v-7.499969h2.1428678v-2.1428925z'
											fill='currentColor'
											fillRule='evenodd'
										></path>
									</svg>
									Facebook
								</a>
							</div>

							<div className='footer__column__element instagram'>
								<a
									href='https://www.instagram.com/pcstore.mx/'
									target='_blank'
									rel='noopener'
									aria-label='Síguenos en Instagram'
									aria-describedby='a11y-new-window-message'
									className='footer__social__icon'
								>
									<svg
										focusable='false'
										className='icon--instagram '
										role='presentation'
										viewBox='0 0 30 30'
									>
										<path
											d='M15 30C6.71572875 30 0 23.2842712 0 15 0 6.71572875 6.71572875 0 15 0c8.2842712 0 15 6.71572875 15 15 0 8.2842712-6.7157288 15-15 15zm.0000159-23.03571429c-2.1823849 0-2.4560363.00925037-3.3131306.0483571-.8553081.03901103-1.4394529.17486384-1.9505835.37352345-.52841925.20532625-.9765517.48009406-1.42331254.926823-.44672894.44676084-.72149675.89489329-.926823 1.42331254-.19865961.5111306-.33451242 1.0952754-.37352345 1.9505835-.03910673.8570943-.0483571 1.1307457-.0483571 3.3131306 0 2.1823531.00925037 2.4560045.0483571 3.3130988.03901103.8553081.17486384 1.4394529.37352345 1.9505835.20532625.5284193.48009406.9765517.926823 1.4233125.44676084.446729.89489329.7214968 1.42331254.9268549.5111306.1986278 1.0952754.3344806 1.9505835.3734916.8570943.0391067 1.1307457.0483571 3.3131306.0483571 2.1823531 0 2.4560045-.0092504 3.3130988-.0483571.8553081-.039011 1.4394529-.1748638 1.9505835-.3734916.5284193-.2053581.9765517-.4801259 1.4233125-.9268549.446729-.4467608.7214968-.8948932.9268549-1.4233125.1986278-.5111306.3344806-1.0952754.3734916-1.9505835.0391067-.8570943.0483571-1.1307457.0483571-3.3130988 0-2.1823849-.0092504-2.4560363-.0483571-3.3131306-.039011-.8553081-.1748638-1.4394529-.3734916-1.9505835-.2053581-.52841925-.4801259-.9765517-.9268549-1.42331254-.4467608-.44672894-.8948932-.72149675-1.4233125-.926823-.5111306-.19865961-1.0952754-.33451242-1.9505835-.37352345-.8570943-.03910673-1.1307457-.0483571-3.3130988-.0483571zm0 1.44787387c2.1456068 0 2.3997686.00819774 3.2471022.04685789.7834742.03572556 1.2089592.1666342 1.4921162.27668167.3750864.14577303.6427729.31990322.9239522.60111439.2812111.28117926.4553413.54886575.6011144.92395217.1100474.283157.2409561.708642.2766816 1.4921162.0386602.8473336.0468579 1.1014954.0468579 3.247134 0 2.1456068-.0081977 2.3997686-.0468579 3.2471022-.0357255.7834742-.1666342 1.2089592-.2766816 1.4921162-.1457731.3750864-.3199033.6427729-.6011144.9239522-.2811793.2812111-.5488658.4553413-.9239522.6011144-.283157.1100474-.708642.2409561-1.4921162.2766816-.847206.0386602-1.1013359.0468579-3.2471022.0468579-2.1457981 0-2.3998961-.0081977-3.247134-.0468579-.7834742-.0357255-1.2089592-.1666342-1.4921162-.2766816-.37508642-.1457731-.64277291-.3199033-.92395217-.6011144-.28117927-.2811793-.45534136-.5488658-.60111439-.9239522-.11004747-.283157-.24095611-.708642-.27668167-1.4921162-.03866015-.8473336-.04685789-1.1014954-.04685789-3.2471022 0-2.1456386.00819774-2.3998004.04685789-3.247134.03572556-.7834742.1666342-1.2089592.27668167-1.4921162.14577303-.37508642.31990322-.64277291.60111439-.92395217.28117926-.28121117.54886575-.45534136.92395217-.60111439.283157-.11004747.708642-.24095611 1.4921162-.27668167.8473336-.03866015 1.1014954-.04685789 3.247134-.04685789zm0 9.26641182c-1.479357 0-2.6785873-1.1992303-2.6785873-2.6785555 0-1.479357 1.1992303-2.6785873 2.6785873-2.6785873 1.4793252 0 2.6785555 1.1992303 2.6785555 2.6785873 0 1.4793252-1.1992303 2.6785555-2.6785555 2.6785555zm0-6.8050167c-2.2790034 0-4.1264612 1.8474578-4.1264612 4.1264612 0 2.2789716 1.8474578 4.1264294 4.1264612 4.1264294 2.2789716 0 4.1264294-1.8474578 4.1264294-4.1264294 0-2.2790034-1.8474578-4.1264612-4.1264294-4.1264612zm5.2537621-.1630297c0-.532566-.431737-.96430298-.964303-.96430298-.532534 0-.964271.43173698-.964271.96430298 0 .5325659.431737.964271.964271.964271.532566 0 .964303-.4317051.964303-.964271z'
											fill='currentColor'
											fillRule='evenodd'
										></path>
									</svg>
									Instagram
								</a>
							</div>
							<div className='footer__column__element tiktok'>
								<a
									href='https://www.tiktok.com/@pcstore.mx'
									target='_blank'
									rel='noopener'
									aria-label='Síguenos en TikTok'
									aria-describedby='a11y-new-window-message'
									className='footer__social__icon'
								>
									<svg
										focusable='false'
										className='icon--tiktok '
										viewBox='0 0 30 30'
									>
										<path
											fillRule='evenodd'
											clipRule='evenodd'
											d='M30 15c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C0 6.716 6.716 0 15 0c8.284 0 15 6.716 15 15zm-7.902-1.966c.133 0 .267-.007.4-.02h.002v-2.708a4.343 4.343 0 01-4.002-3.877h-2.332l-.024 11.363c0 1.394-1.231 2.493-2.625 2.493a2.524 2.524 0 010-5.048c.077 0 .152.01.227.02l.078.01v-2.436a3.334 3.334 0 00-.306-.016 4.945 4.945 0 104.946 4.945v-6.69a4.345 4.345 0 003.636 1.964z'
											fill='currentColor'
										></path>
									</svg>
									<span className='footer__social__label'>TikTok</span>
								</a>
							</div>
						</div>
					</div>
					<div className='footer__column'>
						<div className='footer__column__title'>ACEPTAMOS</div>
						<div className='footer__column__element footer__column__element__payment'>
							<Image
								src='/images/visa-mastercard-logos.png'
								fill
								style={{ objectFit: 'contain' }}
								alt={'Visa MasterCard'}
								draggable='false'
								sizes='auto'
							/>
						</div>
						<div className='footer__column__element footer__column__element__payment'>
							<Image
								src='/images/paypal-logo-footer.png'
								fill
								style={{ objectFit: 'contain' }}
								alt={'Paypal'}
								draggable='false'
								sizes='auto'
							/>
						</div>
						<div className='footer__column__element footer__column__element__payment'>
							<Image
								src='/images/Logotipo_Kueski_pay.png'
								fill
								style={{ objectFit: 'contain' }}
								alt={'KueskiPay'}
								draggable='false'
								sizes='auto'
							/>
						</div>
						<div className='footer__column__element footer__column__element__payment'>
							<Image
								src='/images/logo-oxxo-spei.png'
								fill
								style={{ objectFit: 'contain' }}
								alt={'Oxxo SPEI'}
								draggable='false'
								sizes='auto'
							/>
						</div>
						<div className='footer__column__element footer__column__element__payment'>
							<Image
								src='/images/logo-mercado-pago.png'
								fill
								style={{ objectFit: 'contain' }}
								alt={'Mercado Pago'}
								draggable='false'
								sizes='auto'
							/>
						</div>
					</div>
				</div>
				<aside className='footer__aside'>
					© 2024 PCStore.mx - Hecho en Puebla, Puebla con ❤️
				</aside>
			</div>
			<style jsx>
				{`
					.footer {
						background-color: #ffffff;
						margin-top: 20px !important;
						border-top: 1px solid#eaeaea;
					}

					.footer__container {
						display: flex;
						width: 100%;
						justify-content: space-evenly;
						flex-wrap: wrap;
					}

					.footer__column__title {
						font-weight: 700;
						margin-bottom: 12px;
						width: 100%;
						display: flex;
						align-items: center;
						justify-content: space-between;
					}

					.footer__column {
						padding: 20px 15px;
					}

					.footer__column__element {
						line-height: 2;
						font-size: 16px;
						padding: 5px 0;
						width: 100%;
						position: relative;
					}

					.footer__social__icon {
						display: flex;
					}

					.footer__column__element svg {
						vertical-align: top;
						margin-right: 12px;
						width: 28px;
						height: 28px;
						opacity: 0.4;
						transition: color 0.25s ease-in-out, opacity 0.25s ease-in-out;
						will-change: opacity;
					}

					.facebook:hover svg {
						color: #3b5998;
					}

					.instagram:hover svg {
						color: #d83776;
					}

					.tiktok:hover svg {
						color: #fd355a;
					}
					.footer__column__element:hover svg {
						opacity: 1;
					}

					.footer__column__element__payment {
						height: 50px;
					}

					.footer__aside {
						display: flex;
						justify-content: center;
						line-height: 4;
					}

					.toggle-button {
						width: 30px;
						height: 30px;
						border: none;
						cursor: pointer;
						position: relative;
						background-color: #fff;
						display: none;
					}

					.toggle-button::before,
					.toggle-button::after {
						content: '';
						position: absolute;
						height: 2px;
						width: 10px;
						background-color: #474747;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						transition: transform 0.5s, opacity 0.5s ease-in-out;
					}

					.toggle-button::after {
						opacity: 0;
					}

					.toggle-button.active::before {
						transform: translate(-50%, -50%) rotate(-270deg);
					}

					.toggle-button.active::after {
						opacity: 1;
						transform: translate(-50%, -50%) rotate(-180deg);
					}

					.footer__column__container {
						overflow: hidden;
						transition: max-height 0.5s ease-in-out;
						max-height: 0;
					}

					.footer__column__container--active {
						max-height: 500px;
					}

					@media only screen and (max-width: 48em) {
						.footer__container {
							flex-direction: column;
						}

						.footer__column {
							border-bottom: 1px solid#eaeaea;
						}

						.footer__column__title {
							margin: 0;
							line-height: 2.5;
						}

						.footer__column__element__payment {
							max-width: 100px;
						}
						.toggle-button {
							display: block;
						}

						.container {
							margin-top: 0 !important;
						}
					}
					@media only screen and (min-width: 48em) {
						.footer__column__container {
							max-height: 500px !important;
						}
					}
				`}
			</style>
		</div>
	);
};

export default Footer;
