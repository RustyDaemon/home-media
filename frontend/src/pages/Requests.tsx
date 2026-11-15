import {
	ArrowLeftIcon,
	LinkIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { SkeletonRequestCard } from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useDeleteRequest, useRequests } from '../hooks/useRequests';
import type { Media } from '../types/media';
import type { Request } from '../types/request';
import { formatUnixTimestamp } from '../utils/dateUtils';

interface DeleteModalState {
	isOpen: boolean;
	request: Request | null;
}

export default function Requests() {
	const navigate = useNavigate();
	const { isGuest } = useAuth();
	const { data: requests = [], isLoading } = useRequests();
	const deleteRequestMutation = useDeleteRequest();

	const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
		isOpen: false,
		request: null,
	});

	const handleDelete = () => {
		if (deleteModal.request) {
			deleteRequestMutation.mutate(deleteModal.request.id, {
				onSuccess: () => {
					setDeleteModal({ isOpen: false, request: null });
				},
			});
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Awaiting':
				return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
			case 'Approved':
				return 'bg-green-500/20 text-green-400 border-green-500/30';
			case 'Declined':
				return 'bg-red-500/20 text-red-400 border-red-500/30';
			case 'Bought':
				return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
			default:
				return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
		}
	};

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<Card variant='section' className='p-5'>
					<h1 className='text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent'>
						Media Requests
					</h1>
				</Card>
				<div className='space-y-3'>
					{Array.from({ length: 3 }).map((_, i) => (
						<SkeletonRequestCard key={i} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header with Back Button */}
			<Card variant='section' className='p-5'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<button
							onClick={() => navigate('/')}
							className='p-2 rounded-lg hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer'
							title='Back to Dashboard'
						>
							<ArrowLeftIcon className='h-5 w-5' />
						</button>
						<div>
							<h1 className='text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent'>
								Media Requests
							</h1>
						</div>
					</div>
					{!isGuest && (
						<Button
							onClick={() => navigate('/requests/add')}
							className='flex items-center gap-2'
						>
							<PlusIcon className='h-5 w-5' />
							<span className='hidden sm:inline'>Add Request</span>
						</Button>
					)}
				</div>
			</Card>

			{/* Requests List */}
			{requests.length === 0 ? (
				<div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center'>
					<LinkIcon className='h-16 w-16 mx-auto text-gray-500 mb-4' />
					<h2 className='text-xl font-semibold text-gray-300 mb-2'>
						No requests yet
					</h2>
					<p className='text-gray-400 mb-6'>
						{isGuest
							? 'There are no media requests to view'
							: 'Start by creating your first media request'}
					</p>
				</div>
			) : (
				<div className='grid gap-4'>
					{requests.map(request => (
						<div
							key={request.id}
							className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-200'
						>
							<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
								<div className='flex-1 space-y-3 min-w-0'>
									<div className='flex flex-col sm:flex-row sm:items-start gap-3'>
										<div className='flex-1 min-w-0'>
											{request.title && (
												<h3 className='text-lg font-semibold text-white mb-1 break-words'>
													{request.title}
												</h3>
											)}
											{request.url && (
												<a
													href={request.url}
													target='_blank'
													rel='noopener noreferrer'
													className='text-sky-400 hover:text-sky-300 transition-colors duration-200 flex items-center gap-1 text-sm break-all'
												>
													<LinkIcon className='h-4 w-4 flex-shrink-0' />
													<span className='break-all'>{request.url}</span>
												</a>
											)}
										</div>
										<span
											className={`px-3 py-1 rounded-lg border text-sm font-medium whitespace-nowrap ${getStatusColor(
												request.status
											)}`}
										>
											{request.status}
										</span>
									</div>

									{request.comment && (
										<p className='text-gray-300 text-sm bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 break-words'>
											{request.comment}
										</p>
									)}

									<div className='flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500'>
										<span className='whitespace-nowrap'>
											By: {request.username}
										</span>
										<span className='hidden sm:inline'>•</span>
										<span className='whitespace-nowrap'>
											{formatUnixTimestamp(request.created_at)}
										</span>
										{request.created_at !== request.updated_at && (
											<>
												<span className='hidden sm:inline'>•</span>
												<span className='whitespace-nowrap'>
													Updated: {formatUnixTimestamp(request.updated_at)}
												</span>
											</>
										)}
									</div>
								</div>

								{!isGuest && (
									<div className='flex items-center gap-2 flex-shrink-0 self-start'>
										<button
											onClick={() => navigate(`/requests/edit/${request.id}`)}
											className='p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all duration-200 cursor-pointer'
											title='Edit request'
										>
											<PencilIcon className='h-5 w-5' />
										</button>
										<button
											onClick={() => setDeleteModal({ isOpen: true, request })}
											className='p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-all duration-200 cursor-pointer'
											title='Delete request'
										>
											<TrashIcon className='h-5 w-5' />
										</button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={deleteModal.isOpen}
				media={
					deleteModal.request
						? ({
								id: deleteModal.request.id,
								title:
									deleteModal.request.title ||
									deleteModal.request.url ||
									'this request',
						  } as Media)
						: null
				}
				onClose={() => setDeleteModal({ isOpen: false, request: null })}
				onConfirm={handleDelete}
				isDeleting={deleteRequestMutation.isPending}
			/>
		</div>
	);
}
