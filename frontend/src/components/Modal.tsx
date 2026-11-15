import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
}

const sizes = {
	sm: 'max-w-md',
	md: 'max-w-lg',
	lg: 'max-w-2xl',
	xl: 'max-w-4xl',
	fullscreen: 'max-w-7xl mx-4',
};

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = 'md',
}: ModalProps) {
	return (
		<>
			{isOpen && (
				<div className='fixed inset-0 z-50 overflow-y-auto'>
					{/* Backdrop */}
					<div
						className='fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm'
						onClick={onClose}
					/>

					{/* Modal */}
					<div className='flex min-h-full items-center justify-center p-4'>
						<div
							className={cn('relative w-full card p-6', sizes[size])}
							onClick={e => e.stopPropagation()}
						>
							{/* Header */}
							{title && (
								<div className='flex items-center justify-between mb-6'>
									<h2 className='text-xl font-semibold text-white'>{title}</h2>
									<button
										onClick={onClose}
										className='p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer'
									>
										<XMarkIcon className='h-5 w-5 text-gray-400' />
									</button>
								</div>
							)}

							{/* Content */}
							<div>{children}</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
