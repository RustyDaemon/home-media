import {
	ArrowDownIcon,
	ArrowUpIcon,
	CheckCircleIcon,
	FilmIcon,
	PencilIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { DropdownOption, Media, MediaSortField } from '../types/media';
import {
	getMediaTypeColorClasses,
	getMediaTypeHoverClasses,
} from '../utils/mediaTypeColors';
import Button from './Button';
import LanguageBadge from './LanguageBadge';
import LanguageListModal from './LanguageListModal';
import { SkeletonRow, Skeleton } from './Skeleton';
import StatusBadge from './StatusBadge';

interface MediaTableProps {
	media: Media[];
	isLoading?: boolean;
	sortBy: MediaSortField | null;
	sortOrder: 'asc' | 'desc';
	selectionMode?: boolean;
	selectedIds?: Set<number>;
	onToggleSelect?: (id: number) => void;
	onToggleSelectPage?: () => void;
	onSort: (field: MediaSortField) => void;
	onDelete: (media: Media) => void;
	onView: (media: Media) => void;
}

export default function MediaTable({
	media,
	isLoading = false,
	sortBy,
	sortOrder,
	selectionMode = false,
	selectedIds,
	onToggleSelect,
	onToggleSelectPage,
	onSort,
	onDelete,
	onView,
}: MediaTableProps) {
	const navigate = useNavigate();
	const { isGuest, defaultLanguageId } = useAuth();
	const [languageModal, setLanguageModal] = useState<{
		isOpen: boolean;
		languages: DropdownOption[];
		title: string;
	}>({
		isOpen: false,
		languages: [],
		title: '',
	});

	const renderLanguageBadges = (
		languages: DropdownOption[],
		type: 'audio' | 'subtitles'
	) => {
		if (languages.length === 0) {
			return <span className='text-gray-500'>-</span>;
		}

		// Find the default language
		const defaultLang = languages.find(lang => lang.id === defaultLanguageId);

		// Show only the default language if it exists, otherwise show the first language
		const langToShow = defaultLang || languages[0];
		const hasMore = languages.length > 1;

		return (
			<div className='flex flex-wrap gap-1'>
				<LanguageBadge
					language={langToShow}
					isDefault={langToShow.id === defaultLanguageId}
					size='lg'
				/>
				{hasMore && (
					<button
						onClick={e => {
							e.stopPropagation();
							setLanguageModal({
								isOpen: true,
								languages,
								title: `All ${
									type === 'audio' ? 'Audio' : 'Subtitle'
								} Languages`,
							});
						}}
						className='text-lg px-1.5 py-0.5 bg-gray-800 rounded cursor-pointer border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors'
						title='Show all languages'
					>
						...
					</button>
				)}
			</div>
		);
	};

	const SortIcon = ({ field }: { field: MediaSortField }) => {
		if (sortBy !== field) return null;
		return sortOrder === 'asc' ? (
			<ArrowUpIcon className='h-4 w-4' />
		) : (
			<ArrowDownIcon className='h-4 w-4' />
		);
	};

	if (isLoading) {
		return (
			<>
				{/* Desktop skeleton table */}
				<div className='hidden md:block overflow-x-auto'>
					<table className='w-full table-fixed'>
						<thead>
							<tr className='border-b border-gray-600'>
								<th className='text-left py-3 px-4' style={{ width: '35%' }}>
									Title
								</th>
								<th className='text-left py-3 px-4 w-32'>Type</th>
								<th className='text-left py-3 px-4 w-32'>Status</th>
								<th className='text-left py-3 px-4 w-28'>Audio</th>
								<th className='text-left py-3 px-4 w-28'>Subtitles</th>
								{!isGuest && (
									<th className='text-right py-3 px-4 w-32'>Actions</th>
								)}
							</tr>
						</thead>
						<tbody>
							{Array.from({ length: 8 }).map((_, i) => (
								<SkeletonRow key={i} />
							))}
						</tbody>
					</table>
				</div>
				{/* Mobile skeletons */}
				<div className='md:hidden space-y-4'>
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-lg p-4 space-y-3'
						>
							<Skeleton className='h-5 w-2/3' />
							<Skeleton className='h-3 w-1/3' />
							<div className='grid grid-cols-2 gap-3'>
								<Skeleton className='h-4 w-3/4' />
								<Skeleton className='h-6 w-20 rounded-full' />
							</div>
						</div>
					))}
				</div>
			</>
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
		<>
			{/* Desktop Table View */}
			<div className='hidden md:block overflow-x-auto'>
				<table className='w-full table-fixed'>
					<thead>
						<tr className='border-b border-gray-600'>
							{selectionMode && (
								<th className='py-3 px-4 w-10'>
									<input
										type='checkbox'
										checked={
											media.length > 0 &&
											media.every(item => selectedIds?.has(item.id))
										}
										onChange={() => onToggleSelectPage?.()}
										className='h-4 w-4 accent-sky-500 cursor-pointer'
										title='Select all on this page'
									/>
								</th>
							)}
							<th
								className='text-left py-3 px-4 cursor-pointer hover:text-sky-400 transition-colors select-none'
								style={{ width: '35%' }}
								onClick={() => onSort('title')}
								title='Click to sort by title'
							>
								<div className='flex items-center space-x-1'>
									<span>Title</span>
									<SortIcon field='title' />
								</div>
							</th>
							<th
								className='text-left py-3 px-4 cursor-pointer hover:text-sky-400 transition-colors select-none w-32'
								onClick={() => onSort('media_type')}
								title='Click to sort by media type'
							>
								<div className='flex items-center space-x-1'>
									<span>Type</span>
									<SortIcon field='media_type' />
								</div>
							</th>
							{/* Availability Column*/}
							<th
								className='text-left py-3 px-4 cursor-pointer hover:text-sky-400 transition-colors select-none w-32'
								onClick={() => onSort('availability')}
								title='Click to sort by availability'
							>
								<div className='flex items-center space-x-1'>
									<span>Status</span>
									<SortIcon field='availability' />
								</div>
							</th>
							{/* Audio and Subtitle Flags Columns */}
							<th className='text-left py-3 px-4 w-28'>
								<span>Audio</span>
							</th>
							<th className='text-left py-3 px-4 w-28'>
								<span>Subtitles</span>
							</th>
							{!isGuest && (
								<th className='text-right py-3 px-4 w-32'>Actions</th>
							)}
						</tr>
					</thead>
					<tbody>
						{media.map(item => {
							const colorClasses = getMediaTypeColorClasses(item.media_type);
							const hoverClass = getMediaTypeHoverClasses(item.media_type);
							const isSelected = selectedIds?.has(item.id) ?? false;

							return (
								<tr
									key={item.id}
									onClick={() =>
										selectionMode ? onToggleSelect?.(item.id) : onView(item)
									}
									className={`border-b border-gray-700 transition-colors cursor-pointer ${hoverClass} ${
										isSelected ? 'bg-sky-900/30' : colorClasses.background
									}`}
								>
									{selectionMode && (
										<td className='row-density px-4 w-10'>
											<input
												type='checkbox'
												checked={isSelected}
												onChange={() => onToggleSelect?.(item.id)}
												onClick={e => e.stopPropagation()}
												className='h-4 w-4 accent-sky-500 cursor-pointer'
											/>
										</td>
									)}
									<td className='row-density px-4'>
										<div className='flex items-center gap-2'>
											<p className='font-medium text-white'>{item.title}</p>
											{item.watched && (
												<div
													className='flex items-center gap-1.5'
													title={item.watch_notes || 'Watched'}
												>
													<CheckCircleIcon className='h-4 w-4 text-green-400 flex-shrink-0' />
													{item.rating && (
														<div className='flex items-center gap-0.5'>
															{[...Array(item.rating)].map((_, i) => (
																<StarIconSolid
																	key={i}
																	className='h-3.5 w-3.5 text-yellow-400'
																/>
															))}
														</div>
													)}
												</div>
											)}
										</div>
										{item.ean && (
											<p className='text-sm text-gray-500'>
												EAN:{' '}
												<a
													href={`https://www.blu-ray.com/search/?quicksearch=1&quicksearch_country=all&quicksearch_keyword=${encodeURIComponent(
														item.ean || ''
													)}`}
													target='_blank'
													rel='noopener noreferrer'
													onClick={e => e.stopPropagation()}
													className='text-gray-400 hover:text-blue-400'
												>
													{item.ean}
												</a>
											</p>
										)}
									</td>
									<td className='row-density px-4'>
										<span className='text-gray-300'>
											{item.media_type.label}
										</span>
									</td>
									{/* Availability Column */}
									<td className='row-density px-4'>
										<StatusBadge availability={item.availability} size='md' />
									</td>
									{/* Audio and Subtitle Flags */}
									<td className='row-density px-4'>
										{renderLanguageBadges(item.audio, 'audio')}
									</td>
									<td className='row-density px-4'>
										{renderLanguageBadges(item.subtitles, 'subtitles')}
									</td>
									{!isGuest && (
										<td className='row-density px-4'>
											<div className='flex items-center justify-end space-x-2'>
												{!selectionMode && (
													<>
														<Button
															variant='ghost'
															size='sm'
															onClick={e => {
																e.stopPropagation();
																navigate(`/edit/${item.id}`);
															}}
														>
															<PencilIcon className='h-4 w-4' />
														</Button>
														<Button
															variant='danger'
															size='sm'
															onClick={e => {
																e.stopPropagation();
																onDelete(item);
															}}
														>
															<TrashIcon className='h-4 w-4' />
														</Button>
													</>
												)}
											</div>
										</td>
									)}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Mobile Card View */}
			<div className='md:hidden space-y-4'>
				{media.map(item => {
					const colorClasses = getMediaTypeColorClasses(item.media_type);
					const hoverClass = getMediaTypeHoverClasses(item.media_type);
					const isSelected = selectedIds?.has(item.id) ?? false;

					return (
						<div
							key={item.id}
							onClick={() =>
								selectionMode ? onToggleSelect?.(item.id) : onView(item)
							}
							className={`backdrop-blur-sm border rounded-lg p-4 transition-colors cursor-pointer ${colorClasses.background} ${colorClasses.border} ${hoverClass} ${
								isSelected ? 'ring-2 ring-sky-500/60' : ''
							}`}
						>
							{/* Title and Actions Row */}
							<div className='flex items-start justify-between mb-3'>
								<div className='flex-1 min-w-0 mr-3'>
									<div className='flex items-center gap-2'>
										{selectionMode && (
											<input
												type='checkbox'
												checked={isSelected}
												onChange={() => onToggleSelect?.(item.id)}
												onClick={e => e.stopPropagation()}
												className='h-4 w-4 accent-sky-500 cursor-pointer flex-shrink-0'
											/>
										)}
										<h3 className='font-medium text-white text-sm leading-tight truncate'>
											{item.title}
										</h3>
										{item.watched && (
											<div
												className='flex items-center gap-1.5'
												title={item.watch_notes || 'Watched'}
											>
												<CheckCircleIcon className='h-4 w-4 text-green-400 flex-shrink-0' />
												{item.rating && (
													<div className='flex items-center gap-0.5'>
														{[...Array(item.rating)].map((_, i) => (
															<StarIconSolid
																key={i}
																className='h-3.5 w-3.5 text-yellow-400'
															/>
														))}
													</div>
												)}
											</div>
										)}
									</div>
									{item.ean && (
										<p className='text-xs text-gray-400 mt-1'>
											EAN: {item.ean}
										</p>
									)}
								</div>
								<div className='flex items-center space-x-1 flex-shrink-0'>
									{!isGuest && !selectionMode && (
										<>
											<Button
												variant='ghost'
												size='sm'
												onClick={e => {
													e.stopPropagation();
													navigate(`/edit/${item.id}`);
												}}
												className='p-1'
											>
												<PencilIcon className='h-4 w-4' />
											</Button>
											<Button
												variant='danger'
												size='sm'
												onClick={e => {
													e.stopPropagation();
													onDelete(item);
												}}
												className='p-1'
											>
												<TrashIcon className='h-4 w-4' />
											</Button>
										</>
									)}
								</div>
							</div>{' '}
							{/* Details Grid */}
							<div className='space-y-2 text-sm'>
								{/* Row 1: Type and Status */}
								<div className='grid grid-cols-2 gap-x-4'>
									<div>
										<span className='text-gray-400'>Type:</span>{' '}
										<span className='text-gray-300'>
											{item.media_type.label}
										</span>
									</div>
									<div>
										<span className='text-gray-400'>Status:</span>{' '}
										<StatusBadge availability={item.availability} size='sm' />
									</div>
								</div>

								{/* Row 2: Audio and Subtitle Flags */}
								<div className='grid grid-cols-2 gap-x-4'>
									<div>
										<span className='text-gray-400'>Audio:</span>{' '}
										<div className='flex flex-wrap gap-1 mt-1'>
											{renderLanguageBadges(item.audio, 'audio')}
										</div>
									</div>
									<div>
										<span className='text-gray-400'>Subtitles:</span>{' '}
										<div className='flex flex-wrap gap-1 mt-1'>
											{renderLanguageBadges(item.subtitles, 'subtitles')}
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Language List Modal */}
			<LanguageListModal
				isOpen={languageModal.isOpen}
				onClose={() =>
					setLanguageModal({ isOpen: false, languages: [], title: '' })
				}
				languages={languageModal.languages}
				defaultLanguageId={defaultLanguageId}
				title={languageModal.title}
			/>
		</>
	);
}
