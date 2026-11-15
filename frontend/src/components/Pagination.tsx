import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { cn } from '../utils/cn';
import Card from './Card';
import SelectionModal from './SelectionModal';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
	onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export default function Pagination({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
	onItemsPerPageChange,
}: PaginationProps) {
	const [isPerPageModalOpen, setIsPerPageModalOpen] = useState(false);

	const isShowingAll = itemsPerPage === -1;
	const shouldHidePagination = totalPages <= 1 && !onItemsPerPageChange;

	if (shouldHidePagination) return null;

	const startItem = isShowingAll ? 1 : (currentPage - 1) * itemsPerPage + 1;
	const endItem = isShowingAll
		? totalItems
		: Math.min(currentPage * itemsPerPage, totalItems);

	const getPageNumbers = () => {
		const delta = 2; // Number of pages to show on each side of current page
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else {
			if (totalPages > 1) {
				rangeWithDots.push(totalPages);
			}
		}

		return rangeWithDots;
	};

	const pageNumbers = getPageNumbers();

	const perPageOptions = [
		{ id: 10, value: '10', label: '10' },
		{ id: 25, value: '25', label: '25' },
		{ id: 50, value: '50', label: '50' },
		{ id: -1, value: 'all', label: 'All' },
	];

	const currentPerPageLabel =
		perPageOptions.find(opt => opt.id === itemsPerPage)?.label || '10';

	return (
		<Card
			variant='bar'
			className='flex flex-col lg:flex-row items-center justify-between gap-4 px-4 py-3'
		>
			{/* Items info and per-page selector */}
			<div className='flex flex-col sm:flex-row items-center gap-4'>
				<div className='text-sm text-gray-400'>
					Showing <span className='font-medium text-white'>{startItem}</span> to{' '}
					<span className='font-medium text-white'>{endItem}</span> of{' '}
					<span className='font-medium text-white'>{totalItems}</span> results
				</div>

				{/* Per-page selector */}
				{onItemsPerPageChange && (
					<div className='flex items-center gap-2 text-sm text-gray-400'>
						<span>Show:</span>
						<button
							onClick={() => setIsPerPageModalOpen(true)}
							className={cn(
								'flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
								'border border-gray-700/50 bg-gradient-to-br from-gray-900 to-gray-800 text-white min-w-[60px]',
								'hover:border-sky-500/50 hover:from-sky-600/10 hover:to-cyan-600/10 hover:text-white',
								'focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer'
							)}
						>
							<span>{currentPerPageLabel}</span>
							<svg
								className='h-4 w-4 ml-2 text-gray-400'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 9l-7 7-7-7'
								/>
							</svg>
						</button>
						<span>per page</span>
					</div>
				)}
			</div>

			{/* Page navigation */}
			{!isShowingAll && totalPages > 1 && (
				<div className='flex items-center space-x-2'>
					{/* Previous button */}
					<button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage <= 1}
						className={cn(
							'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
							'border border-gray-700/50 hover:border-sky-500/50 cursor-pointer',
							currentPage <= 1
								? 'text-gray-500 cursor-not-allowed bg-gradient-to-br from-gray-900 to-gray-800'
								: 'text-gray-300 hover:text-white bg-gradient-to-br from-gray-900 to-gray-800 hover:from-sky-600/10 hover:to-cyan-600/10'
						)}
					>
						<ChevronLeftIcon className='h-4 w-4 mr-1' />
						Previous
					</button>

					{/* Page numbers */}
					<div className='flex items-center space-x-1'>
						{pageNumbers.map((pageNumber, index) =>
							pageNumber === '...' ? (
								<span
									key={`dots-${index}`}
									className='px-3 py-2 text-gray-400 text-sm'
								>
									...
								</span>
							) : (
								<button
									key={pageNumber}
									onClick={() => onPageChange(pageNumber as number)}
									className={cn(
										'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
										'border hover:border-sky-500/50 cursor-pointer',
										currentPage === pageNumber
											? 'bg-gradient-to-br from-sky-600/30 to-cyan-600/30 border-sky-400/50 text-white shadow-lg shadow-sky-500/20'
											: 'text-gray-300 hover:text-white bg-gradient-to-br from-gray-900 to-gray-800 hover:from-sky-600/10 hover:to-cyan-600/10 border-gray-700/50'
									)}
								>
									{pageNumber}
								</button>
							)
						)}
					</div>

					{/* Next button */}
					<button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage >= totalPages}
						className={cn(
							'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
							'border border-gray-700/50 hover:border-sky-500/50 cursor-pointer',
							currentPage >= totalPages
								? 'text-gray-500 cursor-not-allowed bg-gradient-to-br from-gray-900 to-gray-800'
								: 'text-gray-300 hover:text-white bg-gradient-to-br from-gray-900 to-gray-800 hover:from-sky-600/10 hover:to-cyan-600/10'
						)}
					>
						Next
						<ChevronRightIcon className='h-4 w-4 ml-1' />
					</button>
				</div>
			)}

			{/* Per-page selection modal */}
			<SelectionModal
				isOpen={isPerPageModalOpen}
				onClose={() => setIsPerPageModalOpen(false)}
				onSelect={option =>
					onItemsPerPageChange && onItemsPerPageChange(option.id)
				}
				options={perPageOptions}
				selectedValue={itemsPerPage}
				title='Items Per Page'
			/>
		</Card>
	);
}
