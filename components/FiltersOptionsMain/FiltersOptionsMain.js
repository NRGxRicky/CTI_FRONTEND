import React, { useState, useCallback, useEffect } from 'react';
import Capitalize from '../../hooks/CapitalizeTitle';
import ToggleButon from '../ToggleButton/ToggleButon';
import { useRouter } from 'next/router';
import { Preloader, TailSpin } from 'react-preloader-icon';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { setLocationStockOnly } from '../../lib/features/locationSlide';
const FiltersOptionsMain = ({
	q,
	itemsAvailables,
	itemsAvailableStore,
	itemsAvailablesFreeShipping,
	itemsAvailablesDiscount,
	brandsAvailables,
	origin_filter_available,
	origin_filter_available_store,
	origin_filter_free_shipping,
	origin_filter_discount,
	origin_brands,
	categoriesAvailables,
	origin_categories,
	attributesAvailables,
	origin_attributes,
	SetParentOpacity,
	loading,
	setFiltersActive,
	filtersActive,
	marca,
	categoria,
	handleFiltersClear,
}) => {
	const router = useRouter();
	const [showBransContainer, setShowBransContainer] = useState(true);
	const [showCategoriesContainer, setShowCategoriesContainer] = useState(true);
	const [showAttributesContainer, setShowAttributesContainer] = useState(true);
	const [attributesCounter, setAttributesCounter] = useState(5);
	const [categoriesCounter, setCategoriesCounter] = useState(5);
	const [brandsCounter, setBrandsCounter] = useState(5);
	const [internalLoading, setInternalLoading] = useState(true);
	const dispatch = useAppDispatch();

	const handdleAppendFilter = ({ target: { name, checked } }) => {
		setFiltersActive((prevState) => ({ ...prevState, [name]: checked }));
	};

	const headerLocationStock = useAppSelector(
		(state) => state.locationSlide.headerLocationStock
	);

	const functionAppendDictionaryBrandFilter = (name, checked) => {
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
	};

	const handdleAppendDictionaryBrandFilter = ({
		target: { name, checked },
	}) => {
		functionAppendDictionaryBrandFilter(name, checked);
	};

	const functionAppendDictionaryCategoryFilter = (name, checked) => {
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
	};

	const handdleAppendDictionaryCategoryFilter = ({
		target: { name, checked },
	}) => {
		functionAppendDictionaryCategoryFilter(name, checked);
	};

	const handdleAppendDictionaryAttributeFilter = ({
		target: { name, checked },
	}) => {
		functionAppendDictionaryAttributeFilter(name, checked);
	};

	const functionAppendDictionaryAttributeFilter = (name, checked) => {
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
	};

	useEffect(() => {
		setInternalLoading(true);
	}, [q]);

	useEffect(() => {
		!loading && setInternalLoading(loading);
	}, [loading]);

	if (internalLoading) {
		return (
			<div className='list-filters__container'>
				<div className='list-filters__loader'>
					<Preloader
						use={TailSpin}
						size={30}
						strokeWidth={8}
						strokeColor='#FF002C'
						duration={900}
					/>
				</div>
				<style jsx>
					{`
						.list-filters__loader {
							padding: 30px 0;
							width: 100%;
							display: flex;
							align-items: center;
							justify-content: center;
							position: relative;
							height: 50vh;
						}

						.mobile__clear-fix__filters {
							height: 54px;
						}

						.list-filters__container {
							position: relative;
						}
					`}
				</style>
			</div>
		);
	}

	return (
		<div>
			<div className='nav__filters__details'>
				<div className='nav__filters__details__container'>
					<div className='nav__filters__header'>
						<div className='nav__filters__header-up__title'>Filtros</div>
						{(origin_filter_available_store ||
							origin_filter_available ||
							origin_filter_free_shipping ||
							origin_brands.length > 0 ||
							origin_attributes.length > 0 ||
							origin_categories.length > 0) && (
							<div
								className='nav__filters__header__clear text--ligth'
								onClick={() => handleFiltersClear()}
							>
								LIMPIAR
							</div>
						)}
					</div>
					<div className='nav_filters__actived'>
						{origin_filter_available && (
							<span
								onClick={() => {
									setFiltersActive((prevState) => ({
										...prevState,
										filter_available: false,
									}));
								}}
							>
								Disponibles <span className='close'></span>
							</span>
						)}
						{headerLocationStock && (
							<span
								onClick={() => {
										
												dispatch(
													setLocationStockOnly(
														filtersActiveMain.filter_available_store
													)
												);
								}}
							>
								Entrega en Puebla <span className='close'></span>
							</span>
						)}
						{origin_filter_free_shipping && (
							<span
								onClick={() => {
									setFiltersActive((prevState) => ({
										...prevState,
										filter_free_shipping: false,
									}));
								}}
							>
								Envío gratis <span className='close'></span>
							</span>
						)}
						{Object.entries(brandsAvailables)
							.filter(([brand, brand_value]) =>
								origin_brands.includes(String(brand_value.id))
							)
							.map(([brand, brand_value]) => (
								<span
									key={brand_value.id}
									onClick={() => {
										functionAppendDictionaryBrandFilter(
											String(brand_value.id),
											false
										);
									}}
								>
									{Capitalize(brand)} <span className='close'></span>
								</span>
							))}

						{Object.keys(categoriesAvailables).length > 0 &&
							categoriesAvailables.map((category) => {
								return Object.entries(category.childrens).length > 0
									? Object.entries(category.childrens)
											.filter(([key, value]) =>
												origin_categories.some((originCategory) =>
													originCategory.endsWith(String(value.ids))
												)
											)
											.map(([key, value]) => (
												<span
													key={key}
													onClick={() => {
														functionAppendDictionaryCategoryFilter(
															String(value.ids),
															false
														);
													}}
												>
													{Capitalize(value.nombre)}{' '}
													<span className='close'></span>
												</span>
											))
									: origin_categories.some((categoryFilter) =>
											categoryFilter.endsWith(String(category.slug))
									  ) && (
											<span
												key={category.id}
												onClick={() => {
													functionAppendDictionaryCategoryFilter(
														String(category.slug),
														false
													);
												}}
											>
												{Capitalize(category.nombre)}{' '}
												<span className='close'></span>
											</span>
									  );
							})}

						{Object.entries(attributesAvailables).map(
							([attribute, attribute_value]) => {
								return Object.entries(attribute_value)
									.filter(([attribute_internal, attribute_internal_value]) =>
										origin_attributes.includes(
											String(attribute_internal_value.ids)
										)
									)
									.map(([attribute_internal, attribute_internal_value]) => (
										<span
											key={attribute_internal_value.ids}
											onClick={() => {
												functionAppendDictionaryAttributeFilter(
													String(attribute_internal_value.ids),
													false
												);
											}}
										>
											{Capitalize(`${attribute}: ${attribute_internal}`)}{' '}
											<span className='close'></span>
										</span>
									));
							}
						)}
					</div>
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
							{headerLocationStock && (
								<div className='nav__filters__option__item'>
									<div className={itemsAvailableStore < 1 && 'text--off'}>
										<ToggleButon
											tchecked={origin_filter_available_store}
											tonChange={() => {
												dispatch(
													setLocationStockOnly(!origin_filter_available_store)
												)
											}}
											tname='filter_available_store'
											tdisabled={itemsAvailableStore > 0 ? false : true}
											tcontent={`Entrega en Puebla (${itemsAvailableStore})`}
										/>
									</div>
								</div>
							)}
							<div className='nav__filters__option__item'>
								<div className={itemsAvailablesFreeShipping < 1 && 'text--off'}>
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
							<div className='nav__filters__option__item'>
								<div className={itemsAvailablesDiscount < 1 && 'text--off'}>
									<ToggleButon
										tchecked={origin_filter_discount}
										tonChange={handdleAppendFilter}
										tname='filter_discount'
										tdisabled={itemsAvailablesDiscount > 0 ? false : true}
										tcontent={`Ofertas (${itemsAvailablesDiscount})`}
									/>
								</div>
							</div>
						</div>
						{marca === 'all' && (
							<div className='nav__filters__section nav__filters__section__brands'>
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
									{Object.entries(brandsAvailables)
										.slice(0, brandsCounter)
										.map(([brand, brand_value]) => (
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
										))}
									{brandsCounter < Object.entries(brandsAvailables).length && (
										<div
											className='nav__show-more text--off'
											onClick={() => setBrandsCounter(brandsCounter + 5)}
										>
											<a>MOSTRAR MÁS...</a>
										</div>
									)}
								</div>
							</div>
						)}
						{Object.keys(categoriesAvailables).length > 0 && (
							<div className='nav__filters__section nav__filters__section__categories'>
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
									{categoriesAvailables
										.slice(0, categoriesCounter)
										.map((category) => {
											return (
												<div
													key={category.id}
													className='nav__filters__option__item'
												>
													{Object.keys(category.childrens).length > 0 ? (
														<div className='nav__filters__sub-title'>
															{category.nombre.toUpperCase()}
														</div>
													) : (
														category.slug !== 'index-' && (
															<div key={category.id}>
																<div
																	className={category.count < 1 && 'text--off'}
																>
																	<ToggleButon
																		tchecked={origin_categories.some(
																			(categoryFilter) =>
																				categoryFilter.endsWith(
																					String(category.slug)
																				)
																		)}
																		tonChange={
																			handdleAppendDictionaryCategoryFilter
																		}
																		tname={category.slug}
																		tdisabled={
																			category.count > 0 ? false : true
																		}
																		tcontent={`${Capitalize(
																			category.nombre
																		)} (${category.count})`}
																	/>
																</div>
															</div>
														)
													)}
													{Object.entries(category.childrens).map(
														([key, value]) => (
															<div
																key={key}
																className='nav__filters__option__item'
															>
																<div className={value.count < 1 && 'text--off'}>
																	<ToggleButon
																		tchecked={origin_categories.some(
																			(category) =>
																				category.endsWith(String(value.ids))
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
									{categoriesCounter <
										Object.entries(categoriesAvailables).length && (
										<div
											className='nav__show-more text--off'
											onClick={() =>
												setCategoriesCounter(categoriesCounter + 5)
											}
										>
											<a>MOSTRAR MÁS...</a>
										</div>
									)}
								</div>
							</div>
						)}
						<div className='nav__filters__section nav__filters__section__attributes'>
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
										<div key={attribute} className='nav__filters__option__item'>
											<div className='nav__filters__sub-title'>{attribute}</div>
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
																tcontent={`${Capitalize(attribute_internal)} (${
																	attribute_internal_value.count
																})`}
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
										onClick={() => setAttributesCounter(attributesCounter + 5)}
									>
										<a>MOSTRAR MÁS...</a>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<style jsx>
				{`
					.nav_filters__actived {
						display: flex;
						width: 100%;
						max-width: 100%;
						height: auto;
						align-items: center;
						flex-wrap: wrap;
						padding: 10px 0;
						border-bottom: 1px solid #eaeaea;
					}

					.nav_filters__actived span {
						background-color: #eaeaea;
						padding: 5px 8px;
						border-radius: 10px;
						margin: 2px;
						display: flex;
						font-size: 12px;
						align-items: center;
						cursor: pointer;
					}

					.nav_filters__actived span:hover {
						text-decoration: line-through;
					}

					.close {
						height: 12px;
						width: 12px;
					}

					.nav__filters__details {
						width: 100%;
						max-width: 100%;
					}

					.nav__filters__details__container {
						max-width: 100%;
						width: 100%;
						height: 100%;

						padding: 0 20px;
					}

					.nav__filters__header {
						width: 100%;
						display: flex;
						flex-wrap: wrap;
						padding: 0 20px;
					}

					.nav__filters__header-up__title {
						flex: 1 0 50%;
						font-size: 16px;
						font-weight: 600;
					}
					.nav__filters__header__clear {
						flex: 1 0 50%;
						text-align: right;
						font-weight: 600;
						cursor: pointer;
						font-size: 12px;
					}

					.nav__filters__loading {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 100%;
						height: 50vh;
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

					.nav__filters__section {
						padding: 20px;
						border-bottom: 1px solid #eaeaea;
					}

					.nav__filters__option__item {
						margin: 15px;
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
						font-size: 16px;
						font-weight: 600;
						cursor: pointer;
					}
					.nav__filters__header__icon {
						flex: 1 0 5%;
						cursor: pointer;
					}

					.nav__show-more {
						text-align: center;
						cursor: pointer;
						border: 1px solid #eaeaea;
						border-radius: 5px;
						padding: 5px;
					}
				`}
			</style>
		</div>
	);
};

export default FiltersOptionsMain;
