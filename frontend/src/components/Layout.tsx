import type { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
	children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	return (
		<div className='min-h-screen bg-gray-900/5 flex flex-col'>
			<Header />
			<main className='container mx-auto px-4 py-8 flex-1'>{children}</main>
			<footer className='py-4 px-4 text-left'>
				<div className='container mx-auto'>
					{/* <p className='text-xs text-gray-600 opacity-60'>v{__APP_VERSION__}</p> */}
				</div>
			</footer>
		</div>
	);
}
