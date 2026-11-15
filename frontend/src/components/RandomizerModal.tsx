import { ArrowPathIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useDropdownOptions, useRandomUnwatched } from '../hooks/useMedia';
import type { Media, MediaSummary } from '../types/media';
import { expandMediaSummary } from '../utils/mediaUtils';
import Button from './Button';
import LanguageBadge from './LanguageBadge';
import ViewDetailsModal from './ViewDetailsModal';

interface RandomizerModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function RandomizerModal({
	isOpen,
	onClose,
}: RandomizerModalProps) {
	const [randomMedia, setRandomMedia] = useState<MediaSummary | null>(null);
	const [isRandomizing, setIsRandomizing] = useState(false);
	const [viewModal, setViewModal] = useState<{
		isOpen: boolean;
		media: Media | null;
	}>({
		isOpen: false,
		media: null,
	});
	const { defaultLanguageId } = useAuth();

	// Clear randomMedia when modal is closed
	const handleClose = () => {
		setRandomMedia(null);
		onClose();
	};

	const { data: dropdownOptions } = useDropdownOptions();
	const { refetch: getRandomUnwatched } = useRandomUnwatched();

	const handleRandomize = async () => {
		setIsRandomizing(true);
		try {
			const result = await getRandomUnwatched();
			if (result.data) {
				setRandomMedia(result.data);
			}
		} catch (error) {
			toast.error(`Failed to get random media: ${(error as Error).message}`);
		} finally {
			setIsRandomizing(false);
		}
	};

	const handleViewDetails = () => {
		if (randomMedia && dropdownOptions) {
			const expandedMedia = expandMediaSummary(randomMedia, dropdownOptions);
			setViewModal({ isOpen: true, media: expandedMedia });
		}
	};

	const expandedMedia: Media | null =
		randomMedia && dropdownOptions
			? expandMediaSummary(randomMedia, dropdownOptions)
			: null;

	if (!isOpen) return null;

	const modalContent = (
		<div className='fixed inset-0 z-[9999] overflow-y-auto'>
			{/* Backdrop */}
			<div
				className='fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm'
				onClick={handleClose}
			/>

			{/* Modal */}
			<div className='flex min-h-full items-center justify-center p-4'>
				<div
					className='relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-6'
					onClick={e => e.stopPropagation()}
				>
					{/* Header */}
					<div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50'>
						<div className='flex items-center gap-3'>
							<h2 className='text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 bg-clip-text text-transparent'>
								What Should I Watch?
							</h2>
						</div>
						<button
							onClick={handleClose}
							className='p-2 rounded-lg hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer'
						>
							<XMarkIcon className='h-5 w-5' />
						</button>
					</div>

					{/* Content */}
					{/* Randomize Button - Fixed text to prevent shifting */}
					<div className='text-center mb-4'>
						<Button
							onClick={handleRandomize}
							loading={isRandomizing}
							disabled={isRandomizing}
							className='px-10 py-3 flex items-center justify-center mx-auto'
						>
							{!isRandomizing && <ArrowPathIcon className='h-5 w-5 mr-2' />}
							Pick For Me
						</Button>
					</div>

					{/* Random Media Details or Empty State */}
					<div className='min-h-[100px]'>
						{randomMedia && expandedMedia ? (
							<div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 space-y-4 border border-gray-700/50 shadow-lg'>
								{/* Title */}
								<div>
									<h3 className='text-2xl font-bold bg-gradient-to-r from-white via-sky-100 to-purple-100 bg-clip-text text-transparent mb-2'>
										{randomMedia.title}
									</h3>
								</div>

								{/* Media Type and Content Type Badges */}
								<div className='flex flex-wrap gap-2'>
									<span className='inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-br from-sky-600/20 to-cyan-600/20 text-sky-300 border border-sky-500/40 shadow-md'>
										{expandedMedia.media_type.label}
									</span>
									<span className='inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-300 border border-purple-500/40 shadow-md'>
										{expandedMedia.content_type.label}
									</span>
								</div>

								{/* Audio */}
								{expandedMedia.audio.length > 0 && (
									<div>
										<label className='block text-sm font-medium text-gray-400 mb-2'>
											Audio Options
										</label>
										<div className='flex flex-wrap gap-2'>
											{expandedMedia.audio.map(audio => (
												<LanguageBadge
													key={audio.id}
													language={audio}
													isDefault={audio.id === defaultLanguageId}
													size='md'
												/>
											))}
										</div>
									</div>
								)}

								{/* Subtitles */}
								{expandedMedia.subtitles.length > 0 && (
									<div>
										<label className='block text-sm font-medium text-gray-400 mb-2'>
											Subtitle Options
										</label>
										<div className='flex flex-wrap gap-2'>
											{expandedMedia.subtitles.map(subtitle => (
												<LanguageBadge
													key={subtitle.id}
													language={subtitle}
													isDefault={subtitle.id === defaultLanguageId}
													size='md'
												/>
											))}
										</div>
									</div>
								)}

								{/* Notes */}
								{randomMedia.notes && (
									<div>
										<label className='block text-sm font-medium text-gray-400 mb-2'>
											Notes
										</label>
										<p className='text-gray-300 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-lg p-3 border border-gray-700/30'>
											{randomMedia.notes}
										</p>
									</div>
								)}

								{/* Additional Media */}
								{randomMedia.additional_media && (
									<div>
										<label className='block text-sm font-medium text-gray-400 mb-2'>
											Additional Media
										</label>
										<p className='text-gray-300 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-lg p-3 border border-gray-700/30'>
											{randomMedia.additional_media}
										</p>
									</div>
								)}

								{/* Preview Button */}
								<div className='flex justify-center pt-4'>
									<Button
										variant='secondary'
										onClick={handleViewDetails}
										className='flex items-center gap-2'
									>
										<EyeIcon className='h-5 w-5' />
										View Full Details
									</Button>
								</div>
							</div>
						) : (
							!isRandomizing && (
								<div className='text-center py-12 text-gray-400'>
									<p>Click the button above to get a random unwatched item!</p>
								</div>
							)
						)}
					</div>

					{/* Close Button */}
					<div className='flex justify-end pt-4 border-t border-gray-700/50'>
						<Button variant='secondary' onClick={handleClose}>
							Close
						</Button>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<>
			{createPortal(modalContent, document.body)}

			{/* View Details Modal */}
			<ViewDetailsModal
				isOpen={viewModal.isOpen}
				media={viewModal.media}
				onClose={() => setViewModal({ isOpen: false, media: null })}
			/>
		</>
	);
}
