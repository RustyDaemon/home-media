import {
	CheckCircleIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	ClockIcon,
	FilmIcon,
	LanguageIcon,
	SpeakerWaveIcon,
	XCircleIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Media } from '../types/media';
import { formatUnixTimestamp } from '../utils/dateUtils';
import Button from './Button';
import LanguageBadge from './LanguageBadge';

interface ViewDetailsModalProps {
	isOpen: boolean;
	media: Media | null;
	onClose: () => void;
}

export default function ViewDetailsModal({
	isOpen,
	media,
	onClose,
}: ViewDetailsModalProps) {
	const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
	const { defaultLanguageId } = useAuth();

	if (!isOpen || !media) return null;

	const modalContent = (
		<div className='fixed inset-0 z-[9999] overflow-y-auto'>
			{/* Backdrop */}
			<div
				className='fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md'
				onClick={onClose}
			/>

			{/* Modal */}
			<div className='flex min-h-full items-center justify-center p-4'>
				<div
					className='relative w-full max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto'
					onClick={e => e.stopPropagation()}
				>
					{/* Hero Section with Title */}
					<div className='relative bg-gradient-to-r from-sky-900/30 via-purple-900/20 to-pink-900/30 border-b border-gray-700/50 p-5'>
						{/* Close button */}
						<button
							onClick={onClose}
							className='absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer z-10'
						>
							<XMarkIcon className='h-6 w-6' />
						</button>

						{/* Title and Status */}
						<div className='space-y-3'>
							<h1 className='text-4xl font-bold bg-gradient-to-r from-white via-sky-100 to-purple-100 bg-clip-text text-transparent pr-12'>
								{media.title}
							</h1>

							{/* Status badges */}
							<div className='flex items-center gap-3 flex-wrap'>
								{/* Watched Status */}
								<div
									className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm border-2 ${
										media.watched
											? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/50 text-green-300'
											: 'bg-gradient-to-r from-gray-700/30 to-gray-600/30 border-gray-500/50 text-gray-300'
									}`}
									title={media.watch_notes || undefined}
								>
									{media.watched ? (
										<>
											<CheckCircleIcon className='h-5 w-5' />
											<span>Watched</span>
										</>
									) : (
										<>
											<XCircleIcon className='h-5 w-5' />
											<span>Unwatched</span>
										</>
									)}
								</div>

								{/* Rating Stars */}
								{media.watched && media.rating && (
									<div className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-2 border-yellow-500/50'>
										{[...Array(media.rating)].map((_, i) => (
											<StarIconSolid
												key={i}
												className='h-5 w-5 text-yellow-400'
											/>
										))}
									</div>
								)}

								{/* Availability Status */}
								<div
									className={`px-3 py-2 text-sm font-semibold rounded-xl border-2 ${
										media.availability.value === 'available'
											? 'bg-gradient-to-r from-green-700/20 to-emerald-700/20 border-green-400/50 text-green-300'
											: media.availability.value === 'delivery'
											? 'bg-gradient-to-r from-yellow-700/20 to-amber-700/20 border-yellow-400/50 text-yellow-300'
											: 'bg-gradient-to-r from-red-700/20 to-rose-700/20 border-red-400/50 text-red-300'
									}`}
								>
									{media.availability.label}
								</div>
							</div>
						</div>
					</div>

					{/* Content Grid */}
					<div className='p-4 space-y-3'>
						{/* Info Cards Row 1 */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{/* Media Type Card */}
							<div className='bg-gradient-to-br from-sky-900/20 to-cyan-900/10 border border-sky-700/30 rounded-xl p-4 hover:border-sky-500/50 transition-all duration-300'>
								<div className='flex items-center gap-3 mb-2'>
									<div className='p-2 bg-sky-500/20 rounded-lg'>
										<FilmIcon className='h-5 w-5 text-sky-400' />
									</div>
									<h3 className='text-sm font-medium text-gray-400'>
										Media Type
									</h3>
								</div>
								<p className='text-xl font-semibold text-white'>
									{media.media_type.label}
								</p>
							</div>

							{/* Content Type Card */}
							<div className='bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-purple-700/30 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-300'>
								<div className='flex items-center gap-3 mb-2'>
									<div className='p-2 bg-purple-500/20 rounded-lg'>
										<FilmIcon className='h-5 w-5 text-purple-400' />
									</div>
									<h3 className='text-sm font-medium text-gray-400'>
										Content Type
									</h3>
								</div>
								<p className='text-xl font-semibold text-white'>
									{media.content_type.label}
								</p>
							</div>
						</div>

						{/* Audio & Subtitles Cards */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{/* Audio Card */}
							<div className='bg-gradient-to-br from-emerald-900/20 to-green-900/10 border border-emerald-700/30 rounded-xl p-4 hover:border-emerald-500/50 transition-all duration-300'>
								<div className='flex items-center gap-3 mb-3'>
									<div className='p-2 bg-emerald-500/20 rounded-lg'>
										<SpeakerWaveIcon className='h-5 w-5 text-emerald-400' />
									</div>
									<h3 className='text-sm font-medium text-gray-400'>
										Audio Options
									</h3>
								</div>
								<div className='flex flex-wrap gap-2'>
									{media.audio.length > 0 ? (
										media.audio.map(audio => (
											<LanguageBadge
												key={audio.id}
												language={audio}
												isDefault={audio.id === defaultLanguageId}
												size='md'
											/>
										))
									) : (
										<span className='text-gray-500'>No audio options</span>
									)}
								</div>
							</div>

							{/* Subtitles Card */}
							<div className='bg-gradient-to-br from-amber-900/20 to-yellow-900/10 border border-amber-700/30 rounded-xl p-4 hover:border-amber-500/50 transition-all duration-300'>
								<div className='flex items-center gap-3 mb-3'>
									<div className='p-2 bg-amber-500/20 rounded-lg'>
										<LanguageIcon className='h-5 w-5 text-amber-400' />
									</div>
									<h3 className='text-sm font-medium text-gray-400'>
										Subtitles
									</h3>
								</div>
								<div className='flex flex-wrap gap-2'>
									{media.subtitles.length > 0 ? (
										media.subtitles.map(subtitle => (
											<LanguageBadge
												key={subtitle.id}
												language={subtitle}
												isDefault={subtitle.id === defaultLanguageId}
												size='md'
											/>
										))
									) : (
										<span className='text-gray-500'>No subtitles</span>
									)}
								</div>
							</div>
						</div>

						{/* EAN Card (if available) */}
						{media.ean && (
							<div className='bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border border-blue-700/30 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300'>
								<h3 className='text-sm font-medium text-gray-400 mb-3'>
									EAN / Barcode
								</h3>
								<div className='flex items-center justify-between gap-4'>
									<p className='text-lg font-mono text-white'>{media.ean}</p>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => {
											const searchUrl = `https://www.blu-ray.com/search/?quicksearch=1&quicksearch_country=all&quicksearch_keyword=${encodeURIComponent(
												media.ean || ''
											)}`;
											window.open(searchUrl, '_blank', 'noopener,noreferrer');
										}}
										className='text-blue-400 hover:text-blue-300 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all'
									>
										Search Blu-ray.com
									</Button>
								</div>
							</div>
						)}

						{/* Notes Section */}
						{media.notes && (
							<div className='bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/50 rounded-xl p-4'>
								<h3 className='text-sm font-medium text-gray-400 mb-3'>
									Notes
								</h3>
								<p className='text-gray-200 leading-relaxed'>{media.notes}</p>
							</div>
						)}

						{/* Additional Media Section */}
						{media.additional_media && (
							<div className='bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/50 rounded-xl p-4'>
								<h3 className='text-sm font-medium text-gray-400 mb-3'>
									Additional Media
								</h3>
								<p className='text-gray-200 leading-relaxed'>
									{media.additional_media}
								</p>
							</div>
						)}

						{/* Watch Notes (if watched and has notes) */}
						{media.watched && media.watch_notes && (
							<div className='bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-700/30 rounded-xl p-4'>
								<h3 className='text-sm font-medium text-gray-400 mb-3'>
									Watch Notes
								</h3>
								<p className='text-gray-200 leading-relaxed'>
									{media.watch_notes}
								</p>
							</div>
						)}

						{/* Technical Details - Collapsible */}
						<div className='bg-gradient-to-br from-gray-800/30 to-gray-700/20 border border-gray-700/50 rounded-xl overflow-hidden'>
							<button
								onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
								className='flex items-center justify-between w-full text-left p-4 hover:bg-gray-700/20 transition-all duration-200'
							>
								<div className='flex items-center gap-3'>
									<div className='p-2 bg-gray-500/20 rounded-lg'>
										<ClockIcon className='h-5 w-5 text-gray-400' />
									</div>
									<h3 className='text-lg font-semibold text-white'>
										Technical Details
									</h3>
								</div>
								{showTechnicalDetails ? (
									<ChevronUpIcon className='h-6 w-6 text-gray-400 transition-transform duration-200' />
								) : (
									<ChevronDownIcon className='h-6 w-6 text-gray-400 transition-transform duration-200' />
								)}
							</button>

							{showTechnicalDetails && (
								<div className='px-5 pb-5 space-y-4 border-t border-gray-700/30 pt-4'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										{/* Edition */}
										{media.edition && media.edition.value !== '-' && (
											<div>
												<h4 className='text-xs font-medium text-gray-500 mb-1'>
													Edition
												</h4>
												<p className='text-gray-300'>{media.edition.label}</p>
											</div>
										)}

										{/* Date Added */}
										<div>
											<h4 className='text-xs font-medium text-gray-500 mb-1'>
												Date Added
											</h4>
											<p className='text-gray-300'>
												{formatUnixTimestamp(media.created_at)}
											</p>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Close Button */}
						<div className='flex justify-center pt-4'>
							<Button
								variant='secondary'
								onClick={onClose}
								className='px-8 py-3 text-lg font-medium'
							>
								Close
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	// Render using React Portal to break out of any container constraints
	return createPortal(modalContent, document.body);
}
