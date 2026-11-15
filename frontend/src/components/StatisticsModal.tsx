import { XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import { useMediaStats } from '../hooks/useMedia';
import { SkeletonStatTiles } from './Skeleton';
import { cn } from '../utils/cn';

interface StatisticsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function StatisticsModal({
	isOpen,
	onClose,
}: StatisticsModalProps) {
	const {
		data: stats,
		isLoading: statsLoading,
		error: statsError,
	} = useMediaStats();

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
						<div className='flex items-center gap-3'>
							<h2 className='text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent'>
								Collection Statistics
							</h2>
						</div>
						<button
							onClick={onClose}
							className='p-2 rounded-lg hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer'
						>
							<XMarkIcon className='h-5 w-5' />
						</button>
					</div>

					{/* Content */}
					<div className='space-y-3'>
						{statsError && (
							<div className='text-yellow-400 text-center py-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20'>
								Could not load statistics: {(statsError as Error).message}
							</div>
						)}

						{statsLoading && <SkeletonStatTiles />}

						{stats && !statsLoading && (
							<>
								{/* Total Count Card */}
								<div className='grid grid-cols-2 gap-3'>
									<div className='bg-gradient-to-br from-sky-600/20 to-cyan-600/20 rounded-xl p-4 border border-sky-500/40 shadow-lg'>
										<div className='text-center'>
											<p className='text-gray-400 text-sm uppercase tracking-wider mb-2'>
												Total Items
											</p>
											<p className='text-5xl font-bold bg-gradient-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent'>
												{stats.total_count}
											</p>
										</div>
									</div>

									{/* Watched Count Card */}
									<div className='bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/40 shadow-lg'>
										<div className='text-center'>
											<p className='text-gray-400 text-sm uppercase tracking-wider mb-2'>
												Watched
											</p>
											<p className='text-5xl font-bold bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent'>
												{stats.watched_count}
											</p>
										</div>
									</div>
								</div>

								{/* Media Type Breakdown */}
								{stats.media_type_counts &&
									stats.media_type_counts.length > 0 && (
										<div>
											<h3 className='text-lg font-semibold text-white mb-4'>
												By Media Type
											</h3>
											<div className='space-y-3'>
												{stats.media_type_counts.map(item => {
													const percentage =
														stats.total_count > 0
															? (
																	(item.count / stats.total_count) *
																	100
															  ).toFixed(1)
															: '0';
													return (
														<div
															key={item.media_type}
															className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-3 border border-gray-700/50 hover:border-sky-500/40 transition-all duration-200 shadow-md'
														>
															<div className='flex items-center justify-between mb-2'>
																<span className='text-gray-300 font-medium capitalize'>
																	{item.media_type}
																</span>
																<span className='text-sky-300 font-semibold'>
																	{item.count}
																</span>
															</div>
															<div className='w-full bg-gray-700/50 rounded-full h-2 overflow-hidden'>
																<div
																	className={cn(
																		'h-full rounded-full transition-all duration-500',
																		'bg-gradient-to-r from-sky-500 to-cyan-500'
																	)}
																	style={{ width: `${percentage}%` }}
																/>
															</div>
														</div>
													);
												})}
											</div>
										</div>
									)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
}
