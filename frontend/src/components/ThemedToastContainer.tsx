import { ToastContainer } from 'react-toastify';
import { isLightTheme, useTheme } from '../contexts/ThemeContext';

// Isolated so theme switches re-render only the toast container, not the app.
// The gray utilities need no light/dark branch: light themes invert the gray
// scale in index.css, so gray-800/900 already render light there. Only
// react-toastify's own theme (icons, close button) has to follow the theme.
export default function ThemedToastContainer() {
	const { theme } = useTheme();

	return (
		<ToastContainer
			position='bottom-center'
			autoClose={2000}
			newestOnTop={true}
			closeOnClick
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme={isLightTheme(theme) ? 'light' : 'dark'}
			toastClassName='!bg-gradient-to-br !from-gray-800/95 !to-gray-900/95 !backdrop-blur-xl !border !border-gray-700/50 !shadow-2xl !rounded-xl'
			className='!text-gray-100 !text-sm !font-medium'
			progressClassName='!bg-gradient-to-r !from-purple-500 !to-cyan-500'
		/>
	);
}
