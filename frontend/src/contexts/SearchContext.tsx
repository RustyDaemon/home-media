import type { ReactNode } from 'react';
import { createContext, useState } from 'react';

interface SearchContextType {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	clearSearch: () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(
	undefined
);

export function SearchProvider({ children }: { children: ReactNode }) {
	const [searchQuery, setSearchQuery] = useState('');

	const clearSearch = () => setSearchQuery('');

	return (
		<SearchContext.Provider
			value={{ searchQuery, setSearchQuery, clearSearch }}
		>
			{children}
		</SearchContext.Provider>
	);
}
