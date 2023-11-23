import React, { useState, useEffect } from 'react';
import HeaderBar from '../HeaderBar/HeaderBar';
import OpacityContainer from '../OpacityContainer/OpacityContainer';
import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile,
} from 'react-device-detect';
import IconWhatsapp from '../IconWhatsapp/IconWhatsapp';

const Layout = ({ children }) => {
	const [opacity, setOpacity] = useState({ opacity: 0, visibility: 'hidden' });
	const [searchVisibility, setSearchVisibility] = useState({ top: '-54px' });
	const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
	const [tempMobile, setTempMobile] = useState(false);

	const SetParentOpacity = (state) => {
		if (!state) {
			setOpacity({ opacity: 0, visibility: 'hidden' });
			setSearchVisibility({ top: '-54px' });
			setSearchBoxVisibility(false);
		} else {
			setOpacity({ opacity: 0.7, visibility: 'visible' });
			setSearchVisibility({ top: '0' });
			setSearchBoxVisibility(true);
		}
	};

	useEffect(() => {
		setTempMobile(isMobile);
	}, [isMobile]);

	return (
		<div>
			<HeaderBar
				SetParentOpacity={SetParentOpacity}
				searchVisibility={searchVisibility}
				searchBoxVisibility={searchBoxVisibility}
				isMobile={tempMobile}
			/>
			<div
				className='mobile__clear-fix'
				style={{ height: tempMobile ? '58px' : '0' }}
			></div>
			{children}
			<OpacityContainer
				opacityContainer={opacity}
				SetParentOpacity={SetParentOpacity}
			/>
			<IconWhatsapp />
		</div>
	);
};

export default Layout;
