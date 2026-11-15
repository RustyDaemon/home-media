import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { DropdownOption } from '../types/media';
import { cn } from '../utils/cn';
import SelectionModal from './SelectionModal';

interface DropdownProps {
	options: DropdownOption[];
	value?: number;
	onChange: (value: number) => void;
	placeholder?: string;
	label?: string;
	error?: string;
	className?: string;
	required?: boolean;
}

export default function Dropdown({
	options,
	value,
	onChange,
	placeholder = 'Select an option',
	label,
	error,
	className,
	required,
}: DropdownProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const selectedOption = options.find(option => option.id === value);

	const handleSelection = (option: DropdownOption) => {
		onChange(option.id);
		setIsModalOpen(false);
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
						'flex items-center gap-2',
						selectedOption ? 'text-white' : 'text-gray-400'
					)}
				>
					{selectedOption?.flag && <span>{selectedOption.flag}</span>}
					<span>{selectedOption ? selectedOption.label : placeholder}</span>
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

			<SelectionModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				options={options}
				selectedValue={value}
				onSelect={handleSelection}
				title={`Select ${label || 'Option'}`}
			/>
		</div>
	);
}
