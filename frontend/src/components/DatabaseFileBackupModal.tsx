import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import Button from './Button';

interface FileBackupModalProps {
	isOpen: boolean;
	onClose: () => void;
	backupFilename: string;
}

export default function DatabaseFileBackupModal({
	isOpen,
	onClose,
	backupFilename,
}: FileBackupModalProps) {
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
					className='relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6'
					onClick={e => e.stopPropagation()}
				>
					{/* Header */}
					<div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50'>
						<h2 className='text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 bg-clip-text text-transparent'>
							Database Backup
						</h2>
						<button
							onClick={onClose}
							className='p-2 rounded-lg hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer'
						>
							<XMarkIcon className='h-5 w-5' />
						</button>
					</div>

					{/* Content */}
					<div className='space-y-6'>
						{/* Success Message */}
						<div className='bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-green-600/20 border-2 border-green-500/50 rounded-xl p-5 shadow-lg'>
							<div className='flex items-start gap-4'>
								<CheckCircleIcon className='h-7 w-7 text-green-400 mt-0.5 flex-shrink-0' />
								<div className='flex-1 space-y-4'>
									<div>
										<h3 className='text-lg font-bold text-green-300 mb-2'>
											Backup Created Successfully
										</h3>
										<p className='text-sm text-gray-200'>
											Your database file has been successfully backed up to the
											server's backup directory.
										</p>
									</div>

									<div className='bg-gradient-to-br from-gray-950/80 to-gray-900/80 rounded-xl p-4 border border-gray-700/50 shadow-inner'>
										<p className='text-xs font-semibold text-gray-400 mb-2'>
											Backup file:
										</p>
										<code className='text-sm text-green-400 font-mono break-all block'>
											{backupFilename}
										</code>
									</div>

									<p className='text-xs text-gray-400'>
										💡 This backup can be used to restore your database in case
										of data loss. Keep your backup files safe and secure.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className='flex justify-end pt-6 border-t border-gray-700/50 mt-6'>
						<Button variant='primary' onClick={onClose} className='group'>
							<span className='group-hover:scale-105 inline-block transition-transform'>
								Done
							</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
}
