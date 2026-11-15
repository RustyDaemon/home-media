import {
	CheckCircleIcon,
	CheckIcon,
	FilmIcon,
	PencilIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Media } from '../types/media';
import {
	getMediaTypeColorClasses,
	getMediaTypeHoverClasses,
	getMediaTypeTextAccent,
} from '../utils/mediaTypeColors';
import LanguageBadge from './LanguageBadge';
import { SkeletonCard } from './Skeleton';
import StatusBadge from './StatusBadge';

interface MediaGridProps {
	media: Media[];
	isLoading?: boolean;
	selectionMode?: boolean;
	selectedIds?: Set<number>;
	onToggleSelect?: (id: number) => void;
	onDelete: (media: Media) => void;
	onView: (media: Media) => void;
}

export default function MediaGrid({
	media,
	isLoading = false,
	selectionMode = false,
	selectedIds,
	onToggleSelect,
	onDelete,
	onView,
}: MediaGridProps) {
	const navigate = useNavigate();
	const { isGuest, defaultLanguageId } = useAuth();

	if (isLoading) {
		return (
			<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
				{Array.from({ length: 10 }).map((_, i) => (
					<SkeletonCard key={i} />
				))}
			</div>
		);
	}

	if (media.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center py-16 px-4'>
				<div className='p-5 rounded-full bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 mb-4'>
					<FilmIcon className='h-10 w-10 text-gray-500' />
				</div>
				<p className='text-gray-300 text-lg font-medium'>No media found</p>
				<p className='text-gray-500 text-sm mt-1'>
					Try clearing filters or adjusting your search
				</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
			{media.map(item => {
				const colorClasses = getMediaTypeColorClasses(item.media_type);
				const hoverClass = getMediaTypeHoverClasses(item.media_type);
				const accentText = getMediaTypeTextAccent(item.media_type);
				const defaultAudio =
					item.audio.find(a => a.id === defaultLanguageId) || item.audio[0];
				const defaultSub =
					item.subtitles.find(s => s.id === defaultLanguageId) ||
					item.subtitles[0];
				const isSelected = selectedIds?.has(item.id) ?? false;

				return (
					<div
						key={item.id}
						onClick={() =>
							selectionMode ? onToggleSelect?.(item.id) : onView(item)
						}
						className={`group relative rounded-xl border backdrop-blur-sm transition-all duration-200 cursor-pointer overflow-hidden ${colorClasses.background} ${colorClasses.border} ${hoverClass} hover:-translate-y-0.5 hover:shadow-xl ${
							isSelected ? 'ring-2 ring-sky-500/60' : ''
						}`}
					>
						{/* Selection indicator */}
						{selectionMode && (
							<div
								className={`absolute top-2 left-2 z-10 h-5 w-5 rounded border flex items-center justify-center transition-colors ${
									isSelected
										? 'bg-sky-500 border-sky-400'
										: 'bg-gray-900/80 border-gray-600'
								}`}
							>
								{isSelected && <CheckIcon className='h-3.5 w-3.5 text-white' />}
							</div>
						)}
						{/* Type ribbon */}
						<div
							className={`px-3 pt-3 pb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider ${accentText}`}
						>
							<span>{item.media_type.label}</span>
							<StatusBadge availability={item.availability} size='xs' />
						</div>

						{/* Title block */}
						<div className='px-3 pb-3'>
							<div className='flex items-start gap-2 min-h-[3rem]'>
								<h3 className='font-semibold text-white text-sm leading-tight line-clamp-2 flex-1'>
									{item.title}
								</h3>
								{item.watched && (
									<CheckCircleIcon
										className='h-4 w-4 text-green-400 flex-shrink-0 mt-0.5'
										title={item.watch_notes || 'Watched'}
									/>
								)}
							</div>

							{item.watched && item.rating && (
								<div className='flex items-center gap-0.5 mt-1.5'>
									{[...Array(item.rating)].map((_, i) => (
										<StarIconSolid
											key={i}
											className='h-3 w-3 text-yellow-400'
										/>
									))}
								</div>
							)}

							{item.ean && (
								<p className='text-[11px] text-gray-500 mt-1.5 truncate'>
									EAN: {item.ean}
								</p>
							)}

							{/* Language badges */}
							<div className='flex flex-wrap gap-1 mt-3 min-h-[1.5rem]'>
								{defaultAudio && (
									<LanguageBadge
										language={defaultAudio}
										isDefault={defaultAudio.id === defaultLanguageId}
										size='sm'
									/>
								)}
								{defaultSub && defaultSub.id !== defaultAudio?.id && (
									<LanguageBadge
										language={defaultSub}
										isDefault={defaultSub.id === defaultLanguageId}
										size='sm'
									/>
								)}
							</div>
						</div>

						{/* Hover actions */}
						{!isGuest && !selectionMode && (
							<div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
								<button
									onClick={e => {
										e.stopPropagation();
										navigate(`/edit/${item.id}`);
									}}
									className='p-1.5 rounded-md bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/50 backdrop-blur-sm cursor-pointer'
									title='Edit'
								>
									<PencilIcon className='h-3.5 w-3.5' />
								</button>
								<button
									onClick={e => {
										e.stopPropagation();
										onDelete(item);
									}}
									className='p-1.5 rounded-md bg-red-900/60 hover:bg-red-800/80 text-red-200 hover:text-white border border-red-700/50 backdrop-blur-sm cursor-pointer'
									title='Delete'
								>
									<TrashIcon className='h-3.5 w-3.5' />
								</button>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
