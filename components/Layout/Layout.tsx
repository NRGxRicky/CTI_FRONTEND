import React, { useState, useEffect, ReactNode } from 'react';
import HeaderBar from '../HeaderBar/HeaderBar';
import OpacityContainer from '../OpacityContainer/OpacityContainer';
import { isMobile as detectIsMobile } from 'react-device-detect';
import IconWhatsapp from '../IconWhatsapp/IconWhatsapp';
import { Providers } from '../../lib/providers';

interface LayoutProps {
	children: ReactNode;
}



const Layout: React.FC<LayoutProps> = ({ children }) => {

	const [isMobile, updateIsMobile] = useState(false);

	useEffect(() => {
		updateIsMobile(detectIsMobile);
	}, [detectIsMobile]);

	return (
		<div>
			<Providers>
				<HeaderBar isMobile={isMobile} />
				<div
					className='mobile__clear-fix'
					style={{ height: isMobile ? '58px' : '0' }}
				></div>
				{children}
				<OpacityContainer />
				<IconWhatsapp />
			</Providers>
		</div>
	);
};

export default Layout;
