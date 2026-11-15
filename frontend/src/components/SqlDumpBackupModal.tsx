import {
	CloudArrowDownIcon,
	DocumentDuplicateIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

interface BackupModalProps {
	isOpen: boolean;
	onClose: () => void;
	sqlDump: string;
}

export default function SqlDumpBackupModal({
	isOpen,
	onClose,
	sqlDump,
}: BackupModalProps) {
	const [copyFeedback, setCopyFeedback] = useState<string>('');

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(sqlDump);
			setCopyFeedback('Copied to clipboard!');
			setTimeout(() => setCopyFeedback(''), 2000);
		} catch {
			setCopyFeedback('Failed to copy');
			setTimeout(() => setCopyFeedback(''), 2000);
		}
	};

	const downloadBackup = () => {
		const now = new Date();
		const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
		const filename = `mm-backup-${dateStr}.sql`;

		const blob = new Blob([sqlDump], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

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
					className='relative w-full max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6'
					onClick={e => e.stopPropagation()}
				>
					{/* Header */}
					<div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50'>
						<h2 className='text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent'>
							Database Dump
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
						<div className='p-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border border-cyan-500/30 rounded-xl'>
							<p className='text-gray-200 text-sm font-medium'>
								Your database dump has been generated successfully.
							</p>
						</div>

						{/* Action Buttons */}
						<div className='flex gap-3'>
							<Button
								variant='secondary'
								onClick={copyToClipboard}
								className='flex items-center gap-2 group flex-1'
							>
								<DocumentDuplicateIcon className='h-5 w-5 group-hover:scale-110 transition-transform' />
								<span>Copy to Clipboard</span>
							</Button>
							<Button
								variant='primary'
								onClick={downloadBackup}
								className='flex items-center gap-2 group flex-1'
							>
								<CloudArrowDownIcon className='h-5 w-5 group-hover:scale-110 transition-transform' />
								<span>Download Dump File</span>
							</Button>
						</div>

						{/* Copy Feedback */}
						{copyFeedback && (
							<div
								className={`p-4 rounded-xl border-2 ${
									copyFeedback.includes('Failed')
										? 'bg-gradient-to-r from-red-600/20 to-rose-600/20 border-red-500/50 text-red-300'
										: 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/50 text-green-300'
								}`}
							>
								<p className='text-sm font-semibold'>{copyFeedback}</p>
							</div>
						)}

						{/* SQL Dump Display */}
						<div className='space-y-3'>
							<label className='block text-sm font-semibold text-gray-300'>
								SQL Dump Preview
							</label>
							<div className='bg-gradient-to-br from-gray-950/80 to-gray-900/80 border border-gray-700/50 rounded-xl p-4 max-h-96 overflow-auto shadow-inner'>
								<pre className='text-cyan-300/90 text-xs font-mono whitespace-pre-wrap break-words'>
									{sqlDump}
								</pre>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className='flex justify-end pt-6 border-t border-gray-700/50 mt-6'>
						<Button
							variant='ghost'
							onClick={onClose}
							className='hover:bg-gray-700/60'
						>
							Close
						</Button>
					</div>
				</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
}
