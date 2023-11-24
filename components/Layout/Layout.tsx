import React, { useState, useEffect, ReactNode } from 'react';
import HeaderBar from '../HeaderBar/HeaderBar';
import OpacityContainer from '../OpacityContainer/OpacityContainer';
import { isMobile as detectIsMobile } from 'react-device-detect';
import IconWhatsapp from '../IconWhatsapp/IconWhatsapp';
import { Properties } from 'csstype';

interface LayoutProps {
	children: ReactNode;
}

interface OpacityState {
	opacity: number;
	visibility: Properties['visibility'];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const [opacity, setOpacity] = useState<OpacityState>({
		opacity: 0,
		visibility: 'hidden',
	});
	const [searchVisibility, setSearchVisibility] = useState({ top: '-54px' });
	const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
	const [isMobile, updateIsMobile] = useState(false);

	const setParentOpacity = (state: boolean): void => {
  const newOpacity: OpacityState = state
    ? { opacity: 0.7, visibility: 'visible' }
    : { opacity: 0, visibility: 'hidden' };

  setOpacity(newOpacity);
  setSearchVisibility({ top: state ? '0' : '-54px' });
  setSearchBoxVisibility(state);
};

	useEffect(() => {
		updateIsMobile(detectIsMobile);
	}, [detectIsMobile]);

	return (
		<div>
			<HeaderBar
				setParentOpacity={setParentOpacity}
				searchVisibility={searchVisibility}
				searchBoxVisibility={searchBoxVisibility}
				isMobile={isMobile}
			/>
			<div
				className='mobile__clear-fix'
				style={{ height: isMobile ? '58px' : '0' }}
			></div>
			{children}
			<OpacityContainer
				opacityContainer={opacity}
				setParentOpacity={setParentOpacity}
			/>
			<IconWhatsapp />
		</div>
	);
};

export default Layout;
