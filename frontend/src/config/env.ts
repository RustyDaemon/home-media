// Frontend environment configuration utility

export interface AppConfig {
	apiBaseUrl: string;
	devMode: boolean;
}

export const config: AppConfig = {
	// Production: Always use /api (relative URL)
	// Development: Use Vite env var or default to localhost
	apiBaseUrl:
		import.meta.env.VITE_API_BASE_URL ||
		(import.meta.env.DEV ? 'http://localhost:8080/api' : '/api'),
	devMode:
		import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV || false,
};

const validateConfig = () => {
	if (!config.apiBaseUrl) {
		console.error('❌ API Base URL configuration error');
		return false;
	}

	if (config.devMode) {
		console.log('🔧 Development mode enabled');
		console.log('📡 API Base URL:', config.apiBaseUrl);
	}

	return true;
};

validateConfig();

export default config;
