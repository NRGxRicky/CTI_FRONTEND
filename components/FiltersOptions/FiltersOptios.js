import React, { useState, useCallback } from 'react';
import Capitalize from '../../hooks/CapitalizeTitle';
import ToggleButon from '../ToggleButton/ToggleButon';
import { useRouter } from 'next/router';
import { Preloader, TailSpin } from 'react-preloader-icon';

const FiltersOptios = ({
	q,
	itemsAvailables,
	itemsAvailableStore,
	itemsAvailablesFreeShipping,
	brandsAvailables,
	origin_filter_available,
	origin_filter_available_store,
	origin_filter_free_shipping,
	origin_brands,
	categoriesAvailables,
	origin_categories,
	attributesAvailables,
	origin_attributes,
	SetParentOpacity,
	loading,
	filtersShow,
	setFiltersActive,
	filtersActive,
	marca,
	categoria,
}) => {
	const router = useRouter();
	const [showBransContainer, setShowBransContainer] = useState(false);
	const [showCategoriesContainer, setShowCategoriesContainer] = useState(false);
	const [showAttributesContainer, setShowAttributesContainer] = useState(false);
	const [attributesCounter, setAttributesCounter] = useState(10);

	const handdleAppendFilter = useCallback(
		({ target: { name, checked } }) => {
			setFiltersActive((prevState) => ({ ...prevState, [name]: checked }));
		},
		[filtersActive]
	);

	const handdleAppendDictionaryBrandFilter = useCallback(
		({ target: { name, checked } }) => {
			const copyState = filtersActive;
			if (!copyState['brands'].includes(name)) {
				if (checked) {
					copyState['brands'].push(name);
				}
			}
			if (copyState['brands'].includes(name)) {
				if (!checked) {
					copyState['brands'] = copyState['brands'].filter((e) => e !== name);
				}
			}
			setFiltersActive((prevState) => ({ ...prevState, ...copyState }));
		},
		[filtersActive]
	);

	const handdleAppendDictionaryCategoryFilter = useCallback(
		({ target: { name, checked } }) => {
			let copyState = filtersActive;
			if (!copyState['categories'].includes(name)) {
				if (checked) {
					copyState['categories'].push(name);
				}
			}
			if (copyState['categories'].includes(name)) {
				if (!checked) {
					copyState['categories'] = copyState['categories'].filter(
						(e) => e !== name
					);
				}
			}
			setFiltersActive((prevState) => ({ ...prevState, ...copyState }));
		},
		[filtersActive]
	);

	const handdleAppendDictionaryAttributeFilter = useCallback(
		({ target: { name, checked } }) => {
			let copyState = filtersActive;
			if (!copyState['attributes'].includes(name)) {
				if (checked) {
					copyState['attributes'].push(name);
				}
			}
			if (copyState['attributes'].includes(name)) {
				if (!checked) {
					copyState['attributes'] = copyState['attributes'].filter(
						(e) => e !== name
					);
				}
			}
			setFiltersActive((prevState) => ({ ...prevState, ...copyState }));
		},
		[filtersActive]
	);

	const handleFiltersToApply = async () => {
		SetParentOpacity(false);
		await router.replace({
			pathname: router.pathname,
			query: { ...router.query, ...filtersActive, page: 1 },
		});
	};

	const handleFiltersClear = async () => {
		SetParentOpacity(false);
		setFiltersActive({
			brands: [],
			categories: [],
			attributes: [],
			filter_available: false,
			filter_available_store: false,
			filter_free_shipping: false,
		});
		await router.replace({
			pathname: router.pathname,
			query: { q, param: [marca, categoria] },
		});
	};

	return (
		<div>
			<div
				className='nav__filters__details'
				style={{
					opacity: !filtersShow ? '0' : '1',
					display: !filtersShow ? 'none' : 'block',
				}}
			>
				<div
					className='nav__filters__details__container'
					style={{ display: !filtersShow ? 'none' : 'block' }}
				>
					<div className='nav__filters__header'>
						<div
							className='nav__filters__header__close'
							onClick={() => SetParentOpacity(false)}
						>
							<button className='close --close-fliters'></button>
						</div>
						<div className='nav__filters__header-up__title'>Filtrar por</div>
					</div>
					{loading ? (
						<div className='nav__filters__loading'>
							<Preloader
								use={TailSpin}
								size={30}
								strokeWidth={8}
								strokeColor='#FF002C'
								duration={900}
							/>
						</div>
					) : (
						<div className='nav__filters__options'>
							<div className='nav__filters__section nav__filters__status'>
								<div className='nav__filters__header__title'>Estado</div>
								<div className='nav__filters__option__item'>
									<div className={itemsAvailables < 1 && 'text--off'}>
										<ToggleButon
											tchecked={origin_filter_available}
											tonChange={handdleAppendFilter}
											tname='filter_available'
											tdisabled={itemsAvailables > 0 ? false : true}
											tcontent={`Disponibles (${itemsAvailables})`}
										/>
									</div>
								</div>
								<div className='nav__filters__option__item'>
									<div className={itemsAvailableStore < 1 && 'text--off'}>
										<ToggleButon
											tchecked={origin_filter_available_store}
											tonChange={handdleAppendFilter}
											tname='filter_available_store'
											tdisabled={itemsAvailableStore > 0 ? false : true}
											tcontent={`Entrega en Puebla (${itemsAvailableStore})`}
										/>
									</div>
								</div>
								<div className='nav__filters__option__item'>
									<div
										className={itemsAvailablesFreeShipping < 1 && 'text--off'}
									>
										<ToggleButon
											tchecked={origin_filter_free_shipping}
											tonChange={handdleAppendFilter}
											tname='filter_free_shipping'
											tdisabled={itemsAvailablesFreeShipping > 0 ? false : true}
											tcontent={`Envío gratis (${itemsAvailablesFreeShipping})`}
											style={'checkbox green'}
										/>
									</div>
								</div>
							</div>
							{marca === 'all' && (
								<div className='nav__filters__section nav__filters__sectiion__brands'>
									<div
										className='nav__filters__header__container'
										onClick={() => setShowBransContainer(!showBransContainer)}
									>
										<div className='nav__filters__header__title'>Marca</div>
										<div className='nav__filters__header__icon'>
											<i
												className={
													showBransContainer
														? 'arrow arrow--up'
														: 'arrow arrow--down'
												}
											></i>
										</div>
									</div>
									<div
										className='nav__filters'
										style={{ display: showBransContainer ? 'block' : 'none' }}
									>
										{Object.entries(brandsAvailables).map(
											([brand, brand_value]) => (
												<div key={brand} className='nav__filters__option__item'>
													<div className={brand_value.count < 1 && 'text--off'}>
														<ToggleButon
															tchecked={origin_brands.includes(
																String(brand_value.id)
															)}
															tonChange={handdleAppendDictionaryBrandFilter}
															tname={brand_value.id}
															tdisabled={brand_value.count > 0 ? false : true}
															tcontent={`${Capitalize(brand)} (${
																brand_value.count
															})`}
														/>
													</div>
												</div>
											)
										)}
									</div>
								</div>
							)}
							<div className='nav__filters__section nav__filters__sectiion__categories'>
								<div
									className='nav__filters__header__container'
									onClick={() =>
										setShowCategoriesContainer(!showCategoriesContainer)
									}
								>
									<div className='nav__filters__header__title'>Categoría</div>
									<div className='nav__filters__header__icon'>
										<i
											className={
												showCategoriesContainer
													? 'arrow arrow--up'
													: 'arrow arrow--down'
											}
										></i>
									</div>
								</div>
								<div
									className='nav__filters'
									style={{
										display: showCategoriesContainer ? 'block' : 'none',
									}}
								>
									{categoriesAvailables.map((category) => {
										return (
											<div
												key={category.id}
												className='nav__filters__option__item'
											>
												<div className='nav__filters__sub-title'>
													{category.nombre.toUpperCase()}
												</div>
												{Object.entries(category.childrens).map(
													([key, value]) => (
														<div
															key={key}
															className='nav__filters__option__item'
														>
															<div className={value.count < 1 && 'text--off'}>
																<ToggleButon
																	tchecked={origin_categories.includes(
																		String(value.ids)
																	)}
																	tonChange={
																		handdleAppendDictionaryCategoryFilter
																	}
																	tname={value.ids}
																	tdisabled={value.count > 0 ? false : true}
																	tcontent={`${Capitalize(value.nombre)} (${
																		value.count
																	})`}
																/>
															</div>
														</div>
													)
												)}
											</div>
										);
									})}
								</div>
							</div>
							<div className='nav__filters__section nav__filters__sectiion__attributes'>
								<div
									className='nav__filters__header__container'
									onClick={() =>
										setShowAttributesContainer(!showAttributesContainer)
									}
								>
									<div className='nav__filters__header__title'>
										Especificaciones
									</div>
									<div className='nav__filters__header__icon'>
										<i
											className={
												showAttributesContainer
													? 'arrow arrow--up'
													: 'arrow arrow--down'
											}
										></i>
									</div>
								</div>
								<div
									className='nav__filters'
									style={{
										display: showAttributesContainer ? 'block' : 'none',
									}}
								>
									{Object.entries(attributesAvailables)
										.slice(0, attributesCounter)
										.map(([attribute, attribute_value]) => (
											<div
												key={attribute}
												className='nav__filters__option__item'
											>
												<div className='nav__filters__sub-title'>
													{attribute}
												</div>
												{Object.entries(attribute_value).map(
													([attribute_internal, attribute_internal_value]) => (
														<div
															key={attribute_internal_value.ids}
															className='nav__filters__option__item'
														>
															<div
																className={
																	attribute_internal_value.count < 1 &&
																	'text--off'
																}
															>
																<ToggleButon
																	tchecked={origin_attributes.includes(
																		String(attribute_internal_value.ids)
																	)}
																	tonChange={
																		handdleAppendDictionaryAttributeFilter
																	}
																	tname={attribute_internal_value.ids}
																	tdisabled={
																		attribute_internal_value.count > 0
																			? false
																			: true
																	}
																	tcontent={`${Capitalize(attribute_internal)} (
															${attribute_internal_value.count})`}
																/>
															</div>
														</div>
													)
												)}
											</div>
										))}
									{attributesCounter <
										Object.entries(attributesAvailables).length && (
										<div
											className='nav__show-more text--off'
											onClick={() =>
												setAttributesCounter(attributesCounter + 10)
											}
										>
											<a>MOSTRAR MÁS...</a>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
					<div className='nav__filters__footer'>
						<div
							className='nav__filters__footer__item nav__filters__footer__clear'
							onClick={() => handleFiltersClear()}
						>
							<a>Limpiar</a>
						</div>
						<div
							className='nav__filters__footer__item nav__filters__footer__apply'
							onClick={() => handleFiltersToApply()}
						>
							<a>Aplicar</a>
						</div>
					</div>
				</div>
			</div>
			<style jsx>
				{`
					.--close-fliters {
						height: 30px;
						width: 30px;
					}

					.nav__filters__details {
						position: fixed;
						left: 0;
						top: 0;
						right: 0;
						bottom: 0;
						opacity: 0;
						z-index: 2050;
						transition: opacity 0.3s ease;
						opacity: 0;
						display: none;
						width: 100%;
						max-width: 100%;
					}

					.nav__filters__details__container {
						max-width: 100%;
						width: 100%;
						height: 100%;
						background: #ffffff;
					}

					.nav__filters__header {
						width: 100%;
						display: flex;
						flex-wrap: wrap;
						height: 54px;
						padding: 0 20px;
						border-bottom: 1px solid #eaeaea;
						background-color: #fff;
						align-items: center;
						justify-content: center;
					}

					.nav__filters__header-up__title {
						flex: 2 0 80%;
						font-size: 18px;
						font-weight: 600;
					}
					.nav__filters__header__close {
						flex: 1 0 20%;
					}

					.nav__filters__footer {
						display: flex;
						width: 100%;
						flex-wrap: wrap;
						position: absolute;
						bottom: 0;
						height: 54px;
						align-items: center;
						justify-content: center;
						text-align: center;
					}

					.nav__filters__loading {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 100%;
						height: 100%;
					}

					.nav__filters__options {
						width: 100%;
						max-width: 100%;
						height: calc(100%- 108px);
						overflow: hidden;
						overflow-y: auto;
					}

					.nav__filters__footer__item {
						flex: 1 0 50%;
						width: 100%;
						height: 100%;
						line-height: 54px;
						font-size: 16px;
						font-weight: 600;
					}

					.nav__filters__footer__apply {
						background-color: #ff002c;
						color: #ffffff;
					}

					.nav__filters__footer__item a:hover,
					.nav__filters__footer__item a:active {
						color: #ffffff;
					}

					.nav__filters__footer__clear {
						background-color: #ffb116;
						color: #ffffff;
					}

					.nav__filters__section {
						padding: 20px;
						border-bottom: 1px solid #eaeaea;
					}

					.nav__filters__option__item {
						margin: 15px;
						font-size: 16px;
					}

					.nav__filters__sub-title {
						font-weight: 600;
					}

					.nav__filters__header__container {
						display: flex;
						flex-wrap: wrap;
						height: 30px;
						line-height: 30px;
					}

					.nav__filters__header__title {
						flex: 1 0 95%;
						font-size: 18px;
						font-weight: 600;
					}
					.nav__filters__header__icon {
						flex: 1 0 5%;
					}

					.nav__show-more {
						text-align: center;
						cursor: pointer;
						border: 1px solid #eaeaea;
						border-radius: 2px;
						padding: 5px;
					}
				`}
			</style>
		</div>
	);
};

export default React.memo(FiltersOptios);
