import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Button from '../components/Button';
import Dropdown from '../components/Dropdown';
import Input from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import { requestSchema, type RequestFormData } from '../schemas/request';

interface RequestFormProps {
	initialData?: Partial<RequestFormData>;
	onSubmit: (data: RequestFormData) => void;
	isLoading?: boolean;
	submitLabel?: string;
	onCancel?: () => void;
}

export default function RequestForm({
	initialData,
	onSubmit,
	isLoading = false,
	submitLabel = 'Save',
	onCancel,
}: RequestFormProps) {
	const { isGuest } = useAuth();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<RequestFormData>({
		resolver: zodResolver(requestSchema),
		defaultValues: {
			title: initialData?.title || '',
			url: initialData?.url || '',
			comment: initialData?.comment || '',
			status: initialData?.status || 'Awaiting',
		},
	});

	const currentStatus = watch('status');

	const statusOptions = [
		{ id: 1, label: 'Awaiting', value: 'Awaiting' },
		{ id: 2, label: 'Approved', value: 'Approved' },
		{ id: 3, label: 'Declined', value: 'Declined' },
		{ id: 4, label: 'Bought', value: 'Bought' },
	];

	const handleFormSubmit = (data: RequestFormData) => {
		onSubmit(data);
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
			<div className='space-y-4'>
				<Input
					label='Title'
					{...register('title')}
					error={errors.title?.message}
					placeholder='Enter media title'
				/>

				<Input
					label='URL'
					{...register('url')}
					error={errors.url?.message}
					placeholder='https://example.com/media'
				/>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Comment
					</label>
					<textarea
						{...register('comment')}
						rows={4}
						className='w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200'
						placeholder='Add any additional comments or notes'
					/>
					{errors.comment && (
						<p className='mt-1 text-sm text-red-400'>
							{errors.comment.message}
						</p>
					)}
				</div>

				{!isGuest && (
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Status
						</label>
						<Dropdown
							options={statusOptions}
							value={
								statusOptions.find(opt => opt.value === currentStatus)?.id || 1
							}
							onChange={value => {
								const status = statusOptions.find(
									opt => opt.id === value
								)?.value;
								if (status) {
									setValue('status', status as RequestFormData['status']);
								}
							}}
						/>
					</div>
				)}
			</div>

			<div className='flex gap-3 pt-4 border-t border-gray-700/50'>
				{onCancel && (
					<Button
						type='button'
						onClick={onCancel}
						variant='secondary'
						disabled={isSubmitting || isLoading}
						className='flex-1'
					>
						Cancel
					</Button>
				)}
				<Button
					type='submit'
					disabled={isSubmitting || isLoading}
					className='flex-1'
				>
					{isSubmitting || isLoading ? 'Saving...' : submitLabel}
				</Button>
			</div>
		</form>
	);
}
