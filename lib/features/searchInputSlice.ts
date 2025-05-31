import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchInputState {
	queryInInput: string;
	shouldShowSearchBar: boolean;
	recentSearches: string[];
	isHydrated: boolean;
}

// Función helper para cargar desde localStorage
const loadRecentSearchesFromStorage = (): string[] => {
	if (typeof window !== 'undefined') {
		try {
			const stored = localStorage.getItem('recentSearches');
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}
	return [];
};

// Función helper para guardar en localStorage
const saveRecentSearchesToStorage = (searches: string[]) => {
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem('recentSearches', JSON.stringify(searches));
		} catch {
			// Ignorar errores de localStorage
		}
	}
};

const initialState: SearchInputState = {
	queryInInput: '',
	shouldShowSearchBar: false,
	recentSearches: [], // ← Empezar vacío para evitar hidratación
	isHydrated: false,
};

export const searchInputSlice = createSlice({
	name: 'searchInput',
	initialState,
	reducers: {
		setQueryInInput: (state, action: PayloadAction<string>) => {
			state.queryInInput = action.payload;
			state.shouldShowSearchBar = false; // Por defecto no mostrar automáticamente
		},
		setQueryInInputWithSearchBar: (state, action: PayloadAction<string>) => {
			state.queryInInput = action.payload;
			state.shouldShowSearchBar = true; // Mostrar automáticamente cuando se escribe
		},
		clearQueryInInput: (state) => {
			state.queryInInput = '';
			state.shouldShowSearchBar = false;
		},
		clearQueryInInputKeepSearchBar: (state) => {
			state.queryInInput = '';
			state.shouldShowSearchBar = true; // Mantener search bar abierto para mostrar búsquedas recientes
		},
		resetShouldShowSearchBar: (state) => {
			state.shouldShowSearchBar = false;
		},
		hydrate: (state) => {
			if (!state.isHydrated) {
				state.recentSearches = loadRecentSearchesFromStorage();
				state.isHydrated = true;
			}
		},
		setRecentSearches: (state, action: PayloadAction<string[]>) => {
			state.recentSearches = action.payload;
			saveRecentSearchesToStorage(state.recentSearches);
		},
		addToRecentSearches: (state, action: PayloadAction<string>) => {
			const query = action.payload.trim();
			if (query === '') return;

			// Remover si ya existe y agregar al principio, limitado a 8
			const updatedSearches = [
				query,
				...state.recentSearches.filter((item) => item !== query),
			].slice(0, 8);
			state.recentSearches = updatedSearches;
			saveRecentSearchesToStorage(state.recentSearches);
		},
		removeFromRecentSearches: (state, action: PayloadAction<string>) => {
			state.recentSearches = state.recentSearches.filter(
				(item) => item !== action.payload
			);
			saveRecentSearchesToStorage(state.recentSearches);
		},
		clearAllRecentSearches: (state) => {
			state.recentSearches = [];
			saveRecentSearchesToStorage(state.recentSearches);
		},
	},
});

export const {
	setQueryInInput,
	setQueryInInputWithSearchBar,
	clearQueryInInput,
	clearQueryInInputKeepSearchBar,
	resetShouldShowSearchBar,
	hydrate,
	setRecentSearches,
	addToRecentSearches,
	removeFromRecentSearches,
	clearAllRecentSearches,
} = searchInputSlice.actions;

export default searchInputSlice.reducer;
