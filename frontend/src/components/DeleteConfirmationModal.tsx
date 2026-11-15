import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Media } from '../types/media';
import Button from './Button';

interface DeleteConfirmationModalProps {
	isOpen: boolean;
	media?: Media | null;
	title?: string;
	message?: ReactNode;
	onClose: () => void;
	onConfirm: () => void;
	isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
	isOpen,
	media,
	title = 'Delete Media',
	message,
	onClose,
	onConfirm,
	isDeleting = false,
}: DeleteConfirmationModalProps) {
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
					<div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50'>
						<div className='flex items-center gap-3'>
							<h2 className='text-2xl font-bold bg-gradient-to-r from-red-400 via-rose-300 to-red-400 bg-clip-text text-transparent'>
								{title}
							</h2>
						</div>
						<button
							onClick={onClose}
							disabled={isDeleting}
							className='p-2 rounded-lg hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
						>
							<XMarkIcon className='h-5 w-5' />
						</button>
					</div>

					{/* Content */}
					<div className='space-y-6'>
						<p className='text-gray-300'>
							{message ?? (
								<>
									Are you sure you want to delete{' '}
									<span className='font-semibold text-white'>
										"{media?.title}"
									</span>
									? This action cannot be undone.
								</>
							)}
						</p>
					</div>

					{/* Footer */}
					<div className='flex space-x-3 justify-end pt-6 border-t border-gray-700/50 mt-6'>
						<Button variant='secondary' onClick={onClose} disabled={isDeleting}>
							Cancel
						</Button>
						<Button variant='danger' onClick={onConfirm} disabled={isDeleting}>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
}
