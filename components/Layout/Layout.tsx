import React, { ReactNode } from 'react';
import HeaderBar from '../HeaderBar/HeaderBar';
import OpacityContainer from '../OpacityContainer/OpacityContainer';
import IconWhatsapp from '../IconWhatsapp/IconWhatsapp';
import { Providers } from '../../lib/providers';
import PaymentsChange from '../PaymentsChange/PaymentsChange';

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
				<PaymentsChange />
				<IconWhatsapp />
			</Providers>
		</div>
	);
};

export default Layout;
