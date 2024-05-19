import React, { ReactNode } from 'react';
import HeaderBar from '../HeaderBar/HeaderBar';
import OpacityContainer from '../OpacityContainer/OpacityContainer';
import IconWhatsapp from '../IconWhatsapp/IconWhatsapp';
import { Providers } from '../../lib/providers';

interface LayoutProps {
	children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

	return (
		<div>
			<Providers>
				<HeaderBar />
				{children}
				<OpacityContainer />
				<IconWhatsapp />
			</Providers>
		</div>
	);
};

export default Layout;
