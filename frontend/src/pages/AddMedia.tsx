import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import MediaForm from '../components/MediaForm';
import { useCreateMedia } from '../hooks/useMedia';
import type { MediaFormData } from '../schemas/media';

export default function AddMedia() {
	const navigate = useNavigate();
	const createMutation = useCreateMedia();

	const handleSubmit = (data: MediaFormData) => {
		createMutation.mutate(data);
	};

	const handleCancel = () => {
		navigate('/');
	};

	return (
		<div className='space-y-4'>
			{/* Header */}
			<Card variant='section' className='p-5'>
				<h1 className='text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent'>
					Add New Media
				</h1>
			</Card>

			{/* Form */}
			<Card>
				<MediaForm
					onSubmit={handleSubmit}
					onCancel={handleCancel}
					isLoading={createMutation.isPending}
					submitLabel='Add Media'
				/>
			</Card>
		</div>
	);
}
