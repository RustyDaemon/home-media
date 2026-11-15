import {
	ChartBarIcon,
	CheckCircleIcon,
	ClipboardDocumentCheckIcon,
	ClipboardDocumentListIcon,
	EyeSlashIcon,
	Squares2X2Icon,
	TableCellsIcon,
	TrashIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import MediaFilters from '../components/MediaFilters';
import MediaGrid from '../components/MediaGrid';
import MediaTable from '../components/MediaTable';
import Pagination from '../components/Pagination';
import RandomizerModal from '../components/RandomizerModal';
import StatisticsModal from '../components/StatisticsModal';
import ViewDetailsModal from '../components/ViewDetailsModal';
import { useAuth } from '../contexts/AuthContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
	useBulkDeleteMedia,
	useBulkSetWatched,
	useDeleteMedia,
	useDropdownOptions,
	useMediaList,
} from '../hooks/useMedia';
import { useRequestsStatus } from '../hooks/useRequestsStatus';
import { useSearch } from '../hooks/useSearch';
import type { Media, MediaSortField } from '../types/media';
import { expandMediaSummary } from '../utils/mediaUtils';

type ViewMode = 'table' | 'grid';
const VIEW_MODE_KEY = 'home-media:view-mode';

function readStoredViewMode(): ViewMode {
	const stored = localStorage.getItem(VIEW_MODE_KEY);
	return stored === 'grid' ? 'grid' : 'table';
}

export default function Dashboard() {
	const { searchQuery } = useSearch();
	const debouncedSearch = useDebouncedValue(searchQuery, 300);
	const navigate = useNavigate();
	const { isGuest } = useAuth();
	const { data: requestsEnabled = false } = useRequestsStatus();

	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [sortField, setSortField] = useState<MediaSortField | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	const [viewMode, setViewMode] = useState<ViewMode>(() =>
		readStoredViewMode()
	);

	useEffect(() => {
		localStorage.setItem(VIEW_MODE_KEY, viewMode);
	}, [viewMode]);

	const [filters, setFilters] = useState({
		type: 0,
		status: 0,
		language: 0,
	});

	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		media: Media | null;
	}>({
		isOpen: false,
		media: null,
	});
	const [viewModal, setViewModal] = useState<{
		isOpen: boolean;
		media: Media | null;
	}>({
		isOpen: false,
		media: null,
	});
	const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
	const [isRandomizerModalOpen, setIsRandomizerModalOpen] = useState(false);

	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

	// Adjust during render (not in an effect) so the query below never fires
	// for the old page with the new search term. Clearing the selection keeps
	// bulk actions from touching items hidden by the new search.
	const [lastSearch, setLastSearch] = useState(debouncedSearch);
	if (debouncedSearch !== lastSearch) {
		setLastSearch(debouncedSearch);
		setCurrentPage(1);
		setSelectedIds(new Set());
	}

	const {
		data: mediaList,
		isLoading,
		error: mediaError,
	} = useMediaList({
		search: debouncedSearch.trim() || undefined,
		sortBy: sortField ?? undefined,
		sortOrder: sortField ? sortDirection : undefined,
		page: currentPage,
		limit: itemsPerPage === -1 ? undefined : itemsPerPage,
		type: filters.type || undefined,
		status: filters.status || undefined,
		language: filters.language || undefined,
	});

	const { data: dropdownOptions } = useDropdownOptions();

	const deleteMediaMutation = useDeleteMedia();
	const bulkDeleteMutation = useBulkDeleteMedia();
	const bulkWatchedMutation = useBulkSetWatched();

	const toggleSelectionMode = () => {
		setSelectionMode(prev => {
			if (prev) {
				setSelectedIds(new Set());
			}
			return !prev;
		});
	};

	const handleToggleSelect = (id: number) => {
		setSelectedIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleSort = (field: MediaSortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const paginatedData: Media[] = useMemo(
		() =>
			mediaList && dropdownOptions
				? mediaList.items.map(item =>
						expandMediaSummary(item, dropdownOptions)
					)
				: [],
		[mediaList, dropdownOptions]
	);

	const totalItems = mediaList?.total ?? 0;
	const totalPages =
		itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage);

	// Clamp the page when the last page shrinks (e.g., after delete)
	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [totalPages, currentPage]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleItemsPerPageChange = (newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage);
		setCurrentPage(1);
	};

	const handleFilterChange = (newFilters: {
		type: number;
		status: number;
		language: number;
	}) => {
		setFilters(newFilters);
		setCurrentPage(1);
		// Drop selections so bulk actions can't touch items the new filter hides
		setSelectedIds(new Set());
	};

	const handleDelete = async () => {
		if (!deleteModal.media) {
			return;
		}
		try {
			await deleteMediaMutation.mutateAsync({
				id: deleteModal.media.id,
				title: deleteModal.media.title,
			});
		} catch {
			// Error toast comes from the mutation; keep the modal open for retry
			return;
		}
		setDeleteModal({ isOpen: false, media: null });
	};

	const handleToggleSelectPage = () => {
		setSelectedIds(prev => {
			const next = new Set(prev);
			const allSelected =
				paginatedData.length > 0 &&
				paginatedData.every(item => next.has(item.id));
			if (allSelected) {
				paginatedData.forEach(item => next.delete(item.id));
			} else {
				paginatedData.forEach(item => next.add(item.id));
			}
			return next;
		});
	};

	const handleBulkWatched = async (watched: boolean) => {
		try {
			await bulkWatchedMutation.mutateAsync({
				ids: [...selectedIds],
				watched,
			});
		} catch {
			// Error toast comes from the mutation; keep the selection for retry
			return;
		}
		setSelectedIds(new Set());
	};

	const handleBulkDelete = async () => {
		try {
			await bulkDeleteMutation.mutateAsync([...selectedIds]);
		} catch {
			// Error toast comes from the mutation; keep the modal open for retry
			return;
		}
		setSelectedIds(new Set());
		setIsBulkDeleteModalOpen(false);
	};

	return (
		<div className='space-y-6'>
			{/* Error Messages */}
			{mediaError && (
				<div className='bg-gradient-to-br from-red-900/30 to-rose-900/20 border border-red-700/50 rounded-xl p-6'>
					<div className='text-red-300 text-center'>
						Error loading media: {(mediaError as Error).message}
					</div>
				</div>
			)}

			{/* Filters and Actions Bar */}
			<Card variant='bar' className='p-4'>
				<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
					{/* Action Buttons */}
					<div className='flex items-center gap-2 flex-shrink-0 lg:order-1'>
						<button
							onClick={() => setIsRandomizerModalOpen(true)}
							className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/40 text-purple-300 hover:border-purple-400/60 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-200 cursor-pointer group'
							title='Random Unwatched'
						>
							<SparklesIcon className='h-4 w-4 group-hover:scale-110 transition-transform' />
							<span className='hidden sm:inline text-sm font-medium'>
								Random
							</span>
						</button>
						<button
							onClick={() => setIsStatsModalOpen(true)}
							className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-sky-600/20 to-cyan-600/20 border border-sky-500/40 text-sky-300 hover:border-sky-400/60 hover:from-sky-600/30 hover:to-cyan-600/30 transition-all duration-200 cursor-pointer group'
							title='View Statistics'
						>
							<ChartBarIcon className='h-4 w-4 group-hover:scale-110 transition-transform' />
							<span className='hidden sm:inline text-sm font-medium'>
								Stats
							</span>
						</button>
						{requestsEnabled && (
							<button
								onClick={() => navigate('/requests')}
								className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400/60 hover:from-emerald-600/30 hover:to-green-600/30 transition-all duration-200 cursor-pointer group'
								title='View Requests'
							>
								<ClipboardDocumentListIcon className='h-4 w-4 group-hover:scale-110 transition-transform' />
								<span className='hidden sm:inline text-sm font-medium'>
									Requests
								</span>
							</button>
						)}

						{/* View mode toggle */}
						<div
							className='hidden md:flex items-center rounded-lg border border-gray-700/50 bg-gray-900/40 ml-1 overflow-hidden'
							role='group'
							aria-label='View mode'
						>
							<button
								onClick={() => setViewMode('table')}
								className={`px-2.5 py-2 transition-all duration-200 cursor-pointer ${
									viewMode === 'table'
										? 'bg-gradient-to-br from-sky-600/30 to-cyan-600/30 text-cyan-200'
										: 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
								}`}
								title='Table view'
								aria-pressed={viewMode === 'table'}
							>
								<TableCellsIcon className='h-4 w-4' />
							</button>
							<button
								onClick={() => setViewMode('grid')}
								className={`px-2.5 py-2 transition-all duration-200 cursor-pointer border-l border-gray-700/50 ${
									viewMode === 'grid'
										? 'bg-gradient-to-br from-sky-600/30 to-cyan-600/30 text-cyan-200'
										: 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
								}`}
								title='Grid view'
								aria-pressed={viewMode === 'grid'}
							>
								<Squares2X2Icon className='h-4 w-4' />
							</button>
						</div>

						{/* Selection mode toggle (admin only) */}
						{!isGuest && (
							<button
								onClick={toggleSelectionMode}
								className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer group ${
									selectionMode
										? 'bg-gradient-to-br from-sky-600/30 to-cyan-600/30 border-sky-400/60 text-cyan-200'
										: 'bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-700/50 text-gray-400 hover:text-gray-200 hover:border-gray-600/60'
								}`}
								title='Select multiple items'
								aria-pressed={selectionMode}
							>
								<ClipboardDocumentCheckIcon className='h-4 w-4 group-hover:scale-110 transition-transform' />
								<span className='hidden sm:inline text-sm font-medium'>
									Select
								</span>
							</button>
						)}
					</div>

					{/* Filters */}
					{dropdownOptions && (
						<div className='flex-1 lg:order-2'>
							<MediaFilters
								typeOptions={dropdownOptions.media_types}
								statusOptions={dropdownOptions.availability}
								languageOptions={dropdownOptions.languages}
								filters={filters}
								onFilterChange={handleFilterChange}
								className='justify-start lg:justify-end'
							/>
						</div>
					)}
				</div>
			</Card>

			{/* Bulk Actions Bar */}
			{selectionMode && selectedIds.size > 0 && (
				<Card variant='bar' className='p-3'>
					<div className='flex flex-wrap items-center gap-3'>
						<span className='text-sm font-medium text-gray-300'>
							{selectedIds.size} selected
						</span>
						<div className='flex flex-wrap items-center gap-2 ml-auto'>
							<button
								onClick={() => handleBulkWatched(true)}
								disabled={bulkWatchedMutation.isPending}
								className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/40 text-green-300 hover:border-green-400/60 hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium'
							>
								<CheckCircleIcon className='h-4 w-4' />
								<span className='hidden sm:inline'>Mark watched</span>
							</button>
							<button
								onClick={() => handleBulkWatched(false)}
								disabled={bulkWatchedMutation.isPending}
								className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-gray-700/40 to-gray-800/40 border border-gray-600/50 text-gray-300 hover:border-gray-500/70 hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium'
							>
								<EyeSlashIcon className='h-4 w-4' />
								<span className='hidden sm:inline'>Mark unwatched</span>
							</button>
							<button
								onClick={() => setIsBulkDeleteModalOpen(true)}
								disabled={bulkDeleteMutation.isPending}
								className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-500/40 text-red-300 hover:border-red-400/60 hover:from-red-600/30 hover:to-rose-600/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium'
							>
								<TrashIcon className='h-4 w-4' />
								<span className='hidden sm:inline'>Delete</span>
							</button>
							<button
								onClick={() => setSelectedIds(new Set())}
								className='flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 transition-all duration-200 cursor-pointer text-sm font-medium'
							>
								<XMarkIcon className='h-4 w-4' />
								<span className='hidden sm:inline'>Clear</span>
							</button>
						</div>
					</div>
				</Card>
			)}

			{/* Media Table / Grid Card */}
			<Card variant='section' className='overflow-hidden'>
				<div className='p-6'>
					{viewMode === 'grid' ? (
						<MediaGrid
							media={paginatedData}
							isLoading={isLoading}
							selectionMode={selectionMode}
							selectedIds={selectedIds}
							onToggleSelect={handleToggleSelect}
							onDelete={media => setDeleteModal({ isOpen: true, media })}
							onView={media => setViewModal({ isOpen: true, media })}
						/>
					) : (
						<MediaTable
							media={paginatedData}
							isLoading={isLoading}
							sortBy={sortField}
							sortOrder={sortDirection}
							selectionMode={selectionMode}
							selectedIds={selectedIds}
							onToggleSelect={handleToggleSelect}
							onToggleSelectPage={handleToggleSelectPage}
							onSort={handleSort}
							onDelete={media => setDeleteModal({ isOpen: true, media })}
							onView={media => setViewModal({ isOpen: true, media })}
						/>
					)}

					{/* Pagination */}
					{totalItems > 0 && (
						<div className='mt-6 pt-6 border-t border-gray-700/50'>
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								totalItems={totalItems}
								itemsPerPage={itemsPerPage}
								onPageChange={handlePageChange}
								onItemsPerPageChange={handleItemsPerPageChange}
							/>
						</div>
					)}
				</div>
			</Card>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={deleteModal.isOpen}
				media={deleteModal.media}
				onClose={() => setDeleteModal({ isOpen: false, media: null })}
				onConfirm={handleDelete}
				isDeleting={deleteMediaMutation.isPending}
			/>

			{/* Bulk Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={isBulkDeleteModalOpen}
				title={`Delete ${selectedIds.size} item${
					selectedIds.size === 1 ? '' : 's'
				}`}
				message={
					<>
						Are you sure you want to delete{' '}
						<span className='font-semibold text-white'>
							{selectedIds.size} selected item
							{selectedIds.size === 1 ? '' : 's'}
						</span>
						? This action cannot be undone.
					</>
				}
				onClose={() => setIsBulkDeleteModalOpen(false)}
				onConfirm={handleBulkDelete}
				isDeleting={bulkDeleteMutation.isPending}
			/>

			{/* View Media Details Modal */}
			<ViewDetailsModal
				isOpen={viewModal.isOpen}
				media={viewModal.media}
				onClose={() => setViewModal({ isOpen: false, media: null })}
			/>

			{/* Statistics Modal */}
			<StatisticsModal
				isOpen={isStatsModalOpen}
				onClose={() => setIsStatsModalOpen(false)}
			/>

			{/* Randomizer Modal */}
			<RandomizerModal
				isOpen={isRandomizerModalOpen}
				onClose={() => setIsRandomizerModalOpen(false)}
			/>
		</div>
	);
}
