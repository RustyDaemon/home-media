import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import RequestForm from '../components/RequestForm';
import { useCreateRequest } from '../hooks/useRequests';
import type { RequestFormData } from '../schemas/request';

export default function AddRequest() {
	const navigate = useNavigate();
	const createRequestMutation = useCreateRequest();

	const handleSubmit = (data: RequestFormData) => {
		createRequestMutation.mutate(data, {
			onSuccess: () => {
				navigate('/requests');
			},
		});
	};

	const handleCancel = () => {
		navigate('/requests');
	};

	return (
		<div className='space-y-4'>
			{/* Header */}
			<Card variant='section' className='p-5'>
				<h1 className='text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent'>
					Add New Request
				</h1>
			</Card>

			{/* Form */}
			<Card>
				<RequestForm
					onSubmit={handleSubmit}
					isLoading={createRequestMutation.isPending}
					submitLabel='Add Request'
					onCancel={handleCancel}
				/>
			</Card>
		</div>
	);
}
