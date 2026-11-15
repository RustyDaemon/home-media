import {
	CogIcon,
	FilmIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../hooks/useSearch';
import VersionBadge from './VersionBadge';

export default function Header() {
	const { searchQuery, setSearchQuery, clearSearch } = useSearch();
	const { isGuest } = useAuth();
	const navigate = useNavigate();
	const mobileSearchRef = useRef<HTMLInputElement>(null);
	const desktopSearchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
			const target = e.target as HTMLElement;
			if (
				target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.tagName === 'SELECT' ||
				target.isContentEditable
			) {
				return;
			}
			e.preventDefault();
			// Focus whichever search input is currently visible
			const visible = [mobileSearchRef.current, desktopSearchRef.current].find(
				el => el && el.offsetParent !== null
			);
			visible?.focus();
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	return (
		<header className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 sticky top-0 z-50 shadow-lg backdrop-blur-md'>
			<div className='container mx-auto px-2 sm:px-4 py-2 sm:py-3'>
				{/* Mobile & Medium Layout */}
				<div className='flex items-center gap-2 lg:hidden'>
					{/* Logo and Version Badge */}
					<div className='flex items-center gap-2 flex-shrink-0'>
						<Link
							to='/'
							className='flex items-center space-x-1 group flex-shrink-0'
						>
							<div className='p-1 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-500'>
								<FilmIcon className='h-5 w-5 text-white' />
							</div>
							<span className='text-sm font-bold bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm block xs:hidden'>
								HM
							</span>
							<span className='text-lg font-bold bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm hidden xs:block'>
								Home Media
							</span>
						</Link>
						<VersionBadge />
					</div>

					{/* Settings Button */}
					<button
						onClick={() => navigate('/settings')}
						className='cursor-pointer bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white border border-gray-700/50 hover:border-gray-600/60 rounded-lg px-2 py-1.5 transition-all duration-200 flex items-center flex-shrink-0 shadow-md'
					>
						<CogIcon className='h-4 w-4' />
					</button>

					{/* Search Bar */}
					<form onSubmit={handleSearch} className='flex-1'>
						<div className='relative flex'>
							<div className='relative flex-1'>
								<MagnifyingGlassIcon className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
								<input
									ref={mobileSearchRef}
									type='text'
									value={searchQuery}
									onChange={handleInputChange}
									placeholder='Search...'
									className='bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-sm border border-gray-700/60 rounded-l-lg w-full pl-7 pr-8 py-1.5 text-sm text-white transition-all duration-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:from-gray-900 focus:to-gray-900 placeholder:text-gray-400/80'
								/>
								{searchQuery && (
									<button
										type='button'
										onClick={clearSearch}
										className='absolute right-2 top-1/2 cursor-pointer transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-white transition-colors duration-200'
									>
										<XMarkIcon className='h-4 w-4' />
									</button>
								)}
							</div>
							<button
								type='submit'
								className='cursor-pointer bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-800 hover:to-sky-600 text-white border border-l-0 border-sky-500/30 hover:border-sky-500/60 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 rounded-r-lg px-2 py-1.5 transition-all duration-200 flex items-center justify-center'
							>
								<MagnifyingGlassIcon className='h-4 w-4' />
							</button>
						</div>
					</form>

					{/* Add Media Button */}
					{!isGuest && (
						<button
							onClick={() => navigate('/add')}
							className='cursor-pointer bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white border border-emerald-500/40 hover:border-emerald-400/60 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 font-medium rounded-lg px-3 py-1.5 transition-all duration-200 flex items-center gap-1 flex-shrink-0'
						>
							<PlusIcon className='h-4 w-4' />
							<span className='hidden sm:inline text-sm font-semibold'>
								Add
							</span>
						</button>
					)}
				</div>

				{/* Desktop Layout */}
				<div className='hidden lg:flex items-center justify-between'>
					{/* Left: Logo and Version Badge */}
					<div className='flex items-center gap-3 flex-shrink-0'>
						<Link
							to='/'
							className='flex items-center space-x-2 group flex-shrink-0'
						>
							<div className='p-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-500'>
								<FilmIcon className='h-6 w-6 text-white' />
							</div>
							<span className='text-xl font-bold bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm'>
								Home Media
							</span>
						</Link>
						<VersionBadge />
					</div>

					{/* Center: Search Bar */}
					<form onSubmit={handleSearch} className='flex-1 max-w-md mx-8'>
						<div className='relative flex'>
							<div className='relative flex-1'>
								<MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
								<input
									ref={desktopSearchRef}
									type='text'
									value={searchQuery}
									onChange={handleInputChange}
									placeholder='Search media...'
									className='bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-sm border border-gray-700/60 rounded-l-lg w-full pl-10 pr-10 py-2 text-white transition-all duration-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:from-gray-900 focus:to-gray-900 placeholder:text-gray-400/80'
								/>
								{searchQuery && (
									<button
										type='button'
										onClick={clearSearch}
										className='absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-white transition-colors duration-200'
									>
										<XMarkIcon className='h-5 w-5' />
									</button>
								)}
							</div>
							<button
								type='submit'
								className='cursor-pointer bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-800 hover:to-sky-600 text-white border border-l-0 border-sky-500/30 hover:border-sky-500/60 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 rounded-r-lg px-4 py-2 transition-all duration-200 flex items-center justify-center'
							>
								<MagnifyingGlassIcon className='h-5 w-5' />
							</button>
						</div>
					</form>

					{/* Right: Add Media Button (prominent) and Settings (icon-only) */}
					<div className='flex items-center space-x-3 flex-shrink-0'>
						{!isGuest && (
							<button
								onClick={() => navigate('/add')}
								className='cursor-pointer bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white border border-emerald-500/40 hover:border-emerald-400/60 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 hover:scale-105 font-semibold rounded-lg px-6 py-2.5 transition-all duration-200 flex items-center space-x-2 text-sm'
							>
								<PlusIcon className='h-5 w-5' />
								<span>Add Media</span>
							</button>
						)}

						<button
							onClick={() => navigate('/settings')}
							className='cursor-pointer bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white border border-gray-700/50 hover:border-gray-600/60 rounded-lg p-2.5 transition-all duration-200 flex items-center shadow-md'
							title='Settings'
						>
							<CogIcon className='h-5 w-5' />
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}
