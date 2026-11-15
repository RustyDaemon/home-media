import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import RequestForm from '../components/RequestForm';
import { useRequests, useUpdateRequest } from '../hooks/useRequests';
import type { RequestFormData } from '../schemas/request';

export default function EditRequest() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { data: requests = [] } = useRequests();
	const updateRequestMutation = useUpdateRequest();

	const request = requests.find(r => r.id === Number(id));

	const handleSubmit = (data: RequestFormData) => {
		if (!id) return;

		updateRequestMutation.mutate(
			{
				id: Number(id),
				data,
			},
			{
				onSuccess: () => {
					navigate('/requests');
				},
			}
		);
	};

	const handleCancel = () => {
		navigate('/requests');
	};

	if (!request) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<div className='text-gray-400'>Request not found</div>
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{/* Header */}
			<Card variant='section' className='p-5'>
				<h1 className='text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent'>
					Edit Request
				</h1>
			</Card>

			{/* Form */}
			<Card>
				<RequestForm
					initialData={request}
					onSubmit={handleSubmit}
					isLoading={updateRequestMutation.isPending}
					submitLabel='Update Request'
					onCancel={handleCancel}
				/>
			</Card>
		</div>
	);
}
