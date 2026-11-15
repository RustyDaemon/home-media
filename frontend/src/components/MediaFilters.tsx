import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { DropdownOption } from '../types/media';
import { cn } from '../utils/cn';
import SelectionModal from './SelectionModal';

interface MediaFiltersProps {
	typeOptions: DropdownOption[];
	statusOptions: DropdownOption[];
	languageOptions: DropdownOption[];
	filters: {
		type: number;
		status: number;
		language: number;
	};
	onFilterChange: (filters: {
		type: number;
		status: number;
		language: number;
	}) => void;
	className?: string;
}

export default function MediaFilters({
	typeOptions,
	statusOptions,
	languageOptions,
	filters,
	onFilterChange,
	className,
}: MediaFiltersProps) {
	const [activeModal, setActiveModal] = useState<
		'type' | 'status' | 'language' | null
	>(null);

	// Add "All Types" and "All Status" options
	const allTypeOptions = [
		{ id: 0, value: 'all', label: '- All Types -' },
		...typeOptions,
	];
	const allStatusOptions = [
		{ id: 0, value: 'all', label: '- All Status -' },
		...statusOptions,
	];
	// Filter out "-" option from language options
	const allLanguageOptions = [
		{ id: 0, value: 'all', label: 'All Languages' },
		...languageOptions.filter(lang => lang.label !== '-'),
	];

	const selectedType = allTypeOptions.find(opt => opt.id === filters.type);
	const selectedStatus = allStatusOptions.find(
		opt => opt.id === filters.status
	);
	const selectedLanguage = allLanguageOptions.find(
		opt => opt.id === filters.language
	);

	const handleFilterChange = (
		field: 'type' | 'status' | 'language',
		value: number
	) => {
		onFilterChange({
			...filters,
			[field]: value,
		});
	};

	const clearFilters = () => {
		onFilterChange({ type: 0, status: 0, language: 0 });
	};

	const hasActiveFilters =
		filters.type !== 0 || filters.status !== 0 || filters.language !== 0;

	return (
		<div className={cn('flex items-center gap-3', className)}>
			{/* Filter Icon */}
			<div className='flex items-center gap-2 text-gray-400'>
				<FunnelIcon className='h-4 w-4' />
				<span className='text-sm font-medium hidden sm:inline'>Filters:</span>
			</div>

			{/* Filter Buttons */}
			<div className='flex items-center gap-2'>
				{/* Type Filter */}
				<button
					onClick={() => setActiveModal('type')}
					className={cn(
						'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200',
						'hover:border-sky-500/50 hover:bg-sky-600/10',
						'focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer',
						filters.type !== 0
							? 'bg-gradient-to-r from-sky-600/20 to-cyan-600/20 border-sky-400/50 text-white'
							: 'bg-gray-900 border-gray-600 text-gray-300 hover:text-white'
					)}
				>
					<span className='hidden sm:inline'>Type: </span>
					{selectedType?.label.replace('- ', '').replace(' -', '') || 'All'}
				</button>

				{/* Status Filter */}
				<button
					onClick={() => setActiveModal('status')}
					className={cn(
						'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200',
						'hover:border-sky-500/50 hover:bg-sky-600/10',
						'focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer',
						filters.status !== 0
							? 'bg-gradient-to-r from-sky-600/20 to-cyan-600/20 border-sky-400/50 text-white'
							: 'bg-gray-900 border-gray-600 text-gray-300 hover:text-white'
					)}
				>
					<span className='hidden sm:inline'>Status: </span>
					{selectedStatus?.label.replace('- ', '').replace(' -', '') || 'All'}
				</button>

				{/* Language Filter */}
				<button
					onClick={() => setActiveModal('language')}
					className={cn(
						'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200',
						'hover:border-sky-500/50 hover:bg-sky-600/10',
						'focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer',
						filters.language !== 0
							? 'bg-gradient-to-r from-sky-600/20 to-cyan-600/20 border-sky-400/50 text-white'
							: 'bg-gray-900 border-gray-600 text-gray-300 hover:text-white'
					)}
				>
					{filters.language === 0 ? (
						<>
							<span className='hidden sm:inline'>Lang: </span>
							<span>All</span>
						</>
					) : (
						selectedLanguage?.flag && (
							<span className=''>{selectedLanguage.flag}</span>
						)
					)}
				</button>

				{/* Clear Filters */}
				{hasActiveFilters && (
					<button
						onClick={clearFilters}
						className='p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-red-600/20 border border-transparent hover:border-red-500/50 transition-all duration-200 cursor-pointer'
						title='Clear all filters'
					>
						<XMarkIcon className='h-4 w-4' />
					</button>
				)}
			</div>

			{/* Type Selection Modal */}
			<SelectionModal
				isOpen={activeModal === 'type'}
				onClose={() => setActiveModal(null)}
				options={allTypeOptions}
				selectedValue={filters.type}
				onSelect={option => {
					handleFilterChange('type', option.id);
					setActiveModal(null);
				}}
				title='Filter by Type'
			/>

			{/* Status Selection Modal */}
			<SelectionModal
				isOpen={activeModal === 'status'}
				onClose={() => setActiveModal(null)}
				options={allStatusOptions}
				selectedValue={filters.status}
				onSelect={option => {
					handleFilterChange('status', option.id);
					setActiveModal(null);
				}}
				title='Filter by Status'
			/>

			{/* Language Selection Modal */}
			<SelectionModal
				isOpen={activeModal === 'language'}
				onClose={() => setActiveModal(null)}
				options={allLanguageOptions}
				selectedValue={filters.language}
				onSelect={option => {
					handleFilterChange('language', option.id);
					setActiveModal(null);
				}}
				title='Filter by Language'
			/>
		</div>
	);
}
