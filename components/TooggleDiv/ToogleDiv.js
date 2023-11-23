import React from 'react';

const ToogleDiv = () => {
  return (
		<div>
			<div className='nav__filters__section'>
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
							tcontent={`Recoge en tienda (${itemsAvailableStore})`}
						/>
					</div>
				</div>
				<div className='nav__filters__option__item'>
					<div className={itemsAvailablesFreeShipping < 1 && 'text--off'}>
						<ToggleButon
							tchecked={origin_filter_free_shipping}
							tonChange={handdleAppendFilter}
							tname='filter_free_shipping'
							tdisabled={itemsAvailablesFreeShipping > 0 ? false : true}
							tcontent={`Envío gratis (${itemsAvailablesFreeShipping})`}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ToogleDiv;