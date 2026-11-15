import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// Load env file based on mode (development, production, etc.)
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [react(), tailwindcss()],
		define: {
			__APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || 'dev'),
		},
		// Make environment variables available to the build process
		envPrefix: 'VITE_',
		// Server configuration for development
		server: {
			port: Number(env.VITE_PORT) || 5173,
			host: env.VITE_HOST || 'localhost',
		},
		// Build configuration
		build: {
			outDir: 'dist',
			sourcemap: mode === 'development',
		},
	};
});
