import { XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import type { DropdownOption } from '../types/media';
import LanguageBadge from './LanguageBadge';

interface LanguageListModalProps {
	isOpen: boolean;
	onClose: () => void;
	languages: DropdownOption[];
	defaultLanguageId: number | null;
	title: string;
}

export default function LanguageListModal({
	isOpen,
	onClose,
	languages,
	defaultLanguageId,
	title,
}: LanguageListModalProps) {
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
					className='relative w-full max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-6'
					onClick={e => e.stopPropagation()}
				>
					{/* Header */}
					<div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50'>
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

					{/* Content */}
					<div className='flex flex-wrap gap-2'>
						{languages.map(lang => (
							<LanguageBadge
								key={lang.id}
								language={lang}
								isDefault={lang.id === defaultLanguageId}
								size='md'
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);

	// Render using React Portal to break out of any container constraints
	return createPortal(modalContent, document.body);
}
