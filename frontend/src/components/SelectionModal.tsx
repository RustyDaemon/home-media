import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import type { DropdownOption } from '../types/media';
import { cn } from '../utils/cn';

interface SelectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (option: DropdownOption) => void;
	options: DropdownOption[];
	selectedValue?: number;
	title: string;
}

export default function SelectionModal({
	isOpen,
	onClose,
	onSelect,
	options,
	selectedValue,
	title,
}: SelectionModalProps) {
	const handleSelect = (option: DropdownOption) => {
		onSelect(option);
		onClose();
	};

	// Sort options: "-" items first, then alphabetically by label
	const sortedOptions = [...options].sort((a, b) => {
		// If 'a' starts with "-", it should come first
		if (a.label.startsWith('-') && !b.label.startsWith('-')) {
			return -1;
		}
		// If 'b' starts with "-", it should come first
		if (!a.label.startsWith('-') && b.label.startsWith('-')) {
			return 1;
		}
		// If both start with "-" or both don't, sort alphabetically
		return a.label.localeCompare(b.label);
	});

	if (!isOpen) return null;

	const modalContent = (
		<div className='fixed inset-0 z-[9999] overflow-y-auto'>
			{/* Backdrop */}
			<div
				className='fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm'
				onClick={onClose}
			/>

			{/* Modal */}
			<div className='flex min-h-full items-center justify-center p-4'>
				<div
					className='relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-6'
					onClick={e => e.stopPropagation()}
				>
					{/* Header */}
					<div className='flex items-center justify-between mb-4 pb-4 border-b border-gray-700/50'>
						<h2 className='text-xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent'>
							{title}
						</h2>
						<button
							onClick={onClose}
							className='p-2 rounded-lg hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer'
						>
							<XMarkIcon className='h-5 w-5 text-gray-400' />
						</button>
					</div>

					{/* Options List */}
					<div className='max-h-80 overflow-y-auto'>
						<div className='space-y-1'>
							{sortedOptions.map(option => (
								<button
									key={option.id}
									onClick={() => handleSelect(option)}
									className={cn(
										'w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200',
										'text-left border border-transparent',
										'hover:bg-gradient-to-br hover:from-sky-600/20 hover:to-cyan-600/20',
										'hover:border-sky-500/40 hover:text-white hover:shadow-md hover:shadow-sky-500/10',
										'focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer',
										selectedValue === option.id
											? 'bg-gradient-to-br from-sky-600/30 to-cyan-600/30 border-sky-400/50 text-white shadow-lg shadow-sky-500/20'
											: 'text-gray-300 hover:text-white'
									)}
								>
									<span className='font-medium flex items-center gap-2'>
										{option.flag && <span>{option.flag}</span>}
										<span>{option.label}</span>
									</span>
									{selectedValue === option.id && (
										<CheckIcon className='h-4 w-4 text-sky-400 flex-shrink-0 drop-shadow-sm' />
									)}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	// Render using React Portal to break out of any container constraints
	return createPortal(modalContent, document.body);
}
