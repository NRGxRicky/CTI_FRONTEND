import React, { createContext, useContext } from 'react';

const EnvContext = createContext();

export function EnvProvider({ children }) {
	// Define las variables de entorno que quieras exponer
	const envVariables = {
		storeName: process.env.NEXT_PUBLIC_STORE_NAME,
		sellerDefaultName: process.env.NEXT_PUBLIC_SELLER_DEFAULT_NAME,
		contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
		facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL,
		instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
		tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL,
		legalName: process.env.NEXT_PUBLIC_LEGAL_NAME,
		infoPageFooter: process.env.NEXT_PUBLIC_INFO_PAGE_FOOTER,
		metaDescription: process.env.NEXT_PUBLIC_META_DESCRIPTION,
		pageUrl: process.env.NEXT_PUBLIC_PAGE_URL,
		titlePostDescription: process.env.NEXT_PUBLIC_TITLE_POST_DESCRIPTION,
		rfc: process.env.NEXT_PUBLIC_RFC,
		phone: process.env.NEXT_PUBLIC_PHONE,
		logoUrl: process.env.NEXT_PUBLIC_LOGO_URL,
		emojiFooter: process.env.NEXT_PUBLIC_FOOTER_EMOJI,
		storeId: process.env.NEXT_PUBLIC_STORE_ID,
	};

	return (
		<EnvContext.Provider value={envVariables}>{children}</EnvContext.Provider>
	);
}

// Hook para usar el contexto fácilmente
export function useEnv() {
	const context = useContext(EnvContext);
	if (!context) {
		throw new Error('useEnv must be used within an EnvProvider');
	}
	return context;
}
