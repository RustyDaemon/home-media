import { FilmIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

export default function NotFound() {
	return (
		<div className='flex items-center justify-center min-h-[60vh]'>
			<Card className='max-w-md w-full text-center space-y-6 py-12'>
				<FilmIcon className='h-16 w-16 mx-auto text-gray-600' />
				<h1 className='text-6xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent'>
					404
				</h1>
				<p className='text-gray-400'>
					This page doesn't exist in your collection.
				</p>
				<Link
					to='/'
					className='inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-all duration-200 ease-in-out bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-800 hover:to-sky-600 text-white border border-sky-500/30 hover:border-sky-500/60 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-0.5'
				>
					<HomeIcon className='h-5 w-5' />
					Back to Dashboard
				</Link>
			</Card>
		</div>
	);
}
