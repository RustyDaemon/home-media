import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { DropdownOption } from '../types/media';
import { cn } from '../utils/cn';
import MultiSelectModal from './MultiSelectModal';

interface MultiSelectDropdownProps {
	label?: string;
	options: DropdownOption[];
	selectedValues: number[];
	onChange: (values: number[]) => void;
	placeholder?: string;
	error?: string;
	required?: boolean;
	className?: string;
}

export default function MultiSelectDropdown({
	label,
	options,
	selectedValues,
	onChange,
	placeholder = 'Select options...',
	error,
	required,
	className,
}: MultiSelectDropdownProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const selectedOptions = options.filter(option =>
		selectedValues.includes(option.id)
	);

	const handleSelection = (values: number[]) => {
		onChange(values);
	};

	const getDisplayText = () => {
		if (selectedOptions.length === 0) {
			return placeholder;
		}

		// If only "-" is selected, show it
		const dashOption = selectedOptions.find(option => option.label === '-');
		if (dashOption && selectedOptions.length === 1) {
			return dashOption.label;
		}

		// Show count for multiple selections (excluding "-" option)
		const nonDashOptions = selectedOptions.filter(
			option => option.label !== '-'
		);

		// 1 selected: show flag + name
		if (nonDashOptions.length === 1) {
			const option = nonDashOptions[0];
			return option.flag ? `${option.flag} ${option.label}` : option.label;
		}

		// 2 selected: show flag + name for both
		if (nonDashOptions.length === 2) {
			return nonDashOptions
				.map(option =>
					option.flag ? `${option.flag} ${option.label}` : option.label
				)
				.join(', ');
		}

		// 3+ selected: show just flags
		if (nonDashOptions.length >= 3) {
			const flags = nonDashOptions.map(option => option.flag).filter(Boolean);
			return flags.length > 0
				? flags.join(' ')
				: `${nonDashOptions.length} selected`;
		}

		return `${nonDashOptions.length} selected`;
	};

	return (
		<div className={cn('relative', className)}>
			{label && (
				<label className='block text-sm font-medium text-gray-300 mb-1'>
					{label}
					{required && <span className='text-red-400 ml-1'>*</span>}
				</label>
			)}

			<button
				type='button'
				onClick={() => setIsModalOpen(true)}
				className={cn(
					'w-full px-3 py-2 bg-gray-900 backdrop-blur-sm border border-gray-600 rounded-lg',
					'text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50',
					'hover:border-sky-400/50 hover:bg-gray-800 transition-all duration-200',
					'flex items-center justify-between cursor-pointer',
					'shadow-sm hover:shadow-md',
					error && 'border-red-500 focus:ring-red-500/50 bg-red-500/10'
				)}
			>
				<span
					className={cn(
						selectedOptions.length > 0 ? 'text-white' : 'text-gray-400'
					)}
				>
					{getDisplayText()}
				</span>
				<ChevronDownIcon
					className='h-5 w-5 text-gray-400 hover:text-sky-400 transition-all duration-200'
					aria-hidden='true'
				/>
			</button>

			{error && (
				<p className='text-sm text-red-400 mt-1 flex items-center gap-1'>
					<span className='w-1 h-1 bg-red-400 rounded-full'></span>
					{error}
				</p>
			)}

			<MultiSelectModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				options={options}
				selectedValues={selectedValues}
				onSelect={handleSelection}
				title={`Select ${label || 'Options'}`}
			/>
		</div>
	);
}
