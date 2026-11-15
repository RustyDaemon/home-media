import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import MediaForm from '../components/MediaForm';
import { SkeletonForm } from '../components/Skeleton';
import { useMediaById, useUpdateMedia } from '../hooks/useMedia';
import type { MediaFormData } from '../schemas/media';

export default function EditMedia() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const { data: media, isLoading: mediaLoading } = useMediaById(Number(id));
	const updateMutation = useUpdateMedia(Number(id));

	const handleSubmit = (data: MediaFormData) => {
		updateMutation.mutate(data);
	};

	const handleCancel = () => {
		navigate('/');
	};

	if (mediaLoading) {
		return (
			<div className='space-y-4'>
				<Card variant='section' className='p-5'>
					<h1 className='text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent'>
						Edit Media
					</h1>
				</Card>
				<Card>
					<SkeletonForm />
				</Card>
			</div>
		);
	}

	if (!media) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-400 text-lg'>Media not found</p>
				<Button onClick={() => navigate('/')} className='mt-4'>
					Back to Dashboard
				</Button>
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{/* Header */}
			<Card variant='section' className='p-5'>
				<h1 className='text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent'>
					Edit Media
				</h1>
			</Card>

			{/* Form */}
			<Card>
				<MediaForm
					onSubmit={handleSubmit}
					onCancel={handleCancel}
					isLoading={updateMutation.isPending}
					submitLabel='Update Media'
					initialData={{
						media_type: media.media_type_id,
						content_type: media.content_type_id,
						availability: media.availability_id,
						title: media.title,
						ean: media.ean || '',
						audio: media.audio_ids,
						subtitles: media.subtitle_ids,
						edition: media.edition_id,
						notes: media.notes || '',
						additional_media: media.additional_media || '',
						watched: media.watched,
						rating: media.rating,
						watch_notes: media.watch_notes || '',
					}}
				/>
			</Card>
		</div>
	);
}
