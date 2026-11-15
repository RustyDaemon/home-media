import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react';

export type Theme =
	| 'midnight'
	| 'nord'
	| 'cyberpunk'
	| 'linen'
	| 'snow'
	| 'steampunk'
	| 'homelab'
	| 'arch';
export type Density = 'comfortable' | 'compact';

interface ThemeContextValue {
	theme: Theme;
	density: Density;
	setTheme: (theme: Theme) => void;
	setDensity: (density: Density) => void;
}

const THEME_STORAGE_KEY = 'home-media:theme';
const DENSITY_STORAGE_KEY = 'home-media:density';
const DEFAULT_THEME: Theme = 'midnight';
const DEFAULT_DENSITY: Density = 'comfortable';

const VALID_THEMES: Theme[] = [
	'midnight',
	'nord',
	'cyberpunk',
	'linen',
	'snow',
	'steampunk',
	'homelab',
	'arch',
];
const VALID_DENSITIES: Density[] = ['comfortable', 'compact'];

export const LIGHT_THEMES: Theme[] = ['linen', 'snow'];

export function isLightTheme(theme: Theme): boolean {
	return LIGHT_THEMES.includes(theme);
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): Theme {
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	if (VALID_THEMES.includes(stored as Theme)) {
		return stored as Theme;
	}
	if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
		return 'snow';
	}
	return DEFAULT_THEME;
}

function readStoredDensity(): Density {
	const stored = localStorage.getItem(DENSITY_STORAGE_KEY);
	return VALID_DENSITIES.includes(stored as Density)
		? (stored as Density)
		: DEFAULT_DENSITY;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());
	const [density, setDensityState] = useState<Density>(() => readStoredDensity());

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}, [theme]);

	useEffect(() => {
		document.documentElement.setAttribute('data-density', density);
		localStorage.setItem(DENSITY_STORAGE_KEY, density);
	}, [density]);

	return (
		<ThemeContext.Provider
			value={{
				theme,
				density,
				setTheme: setThemeState,
				setDensity: setDensityState,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return ctx;
}
