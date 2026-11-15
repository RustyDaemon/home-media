import {
	ChevronDownIcon,
	ChevronUpIcon,
	StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../components/Button';
import Dropdown from '../components/Dropdown';
import Input from '../components/Input';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import { useAuth } from '../contexts/AuthContext';
import { useDropdownOptions } from '../hooks/useMedia';
import { mediaSchema, type MediaFormData } from '../schemas/media';

interface MediaFormProps {
	initialData?: Partial<MediaFormData>;
	onSubmit: (data: MediaFormData) => void;
	isLoading?: boolean;
	submitLabel?: string;
	onCancel?: () => void;
}

export default function MediaForm({
	initialData,
	onSubmit,
	isLoading = false,
	submitLabel = 'Save',
	onCancel,
}: MediaFormProps) {
	const { isGuest } = useAuth();
	const [showAdvancedFields, setShowAdvancedFields] = useState(true);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<MediaFormData>({
		resolver: zodResolver(mediaSchema),
		defaultValues: {
			media_type: 0, // No default, user must choose
			content_type: 1, // Default to "-"
			availability: 1, // Default to "Available"
			title: '',
			ean: '',
			audio: [1], // Default to "-" option (ID 1)
			subtitles: [1], // Default to "-" option (ID 1)
			edition: 1, // Default to "-"
			notes: '',
			additional_media: '',
			watched: false,
			rating: undefined,
			watch_notes: '',
			...initialData,
		},
	});

	const formData = watch();

	const { data: dropdownOptions } = useDropdownOptions();

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
			{/* Title - Full width */}
			<Input
				label='Title'
				{...register('title')}
				placeholder='Enter media title'
				error={errors.title?.message}
				required
			/>

			{/* Row 1: Media Type, Content Type, Audio, Subtitles - 4 columns on large screens */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<Dropdown
					label='Media Type'
					options={dropdownOptions?.media_types || []}
					value={formData.media_type}
					onChange={value => setValue('media_type', value)}
					placeholder='Select media type'
					error={errors.media_type?.message}
					required
				/>

				<Dropdown
					label='Type of Content'
					options={dropdownOptions?.content_types || []}
					value={formData.content_type}
					onChange={value => setValue('content_type', value)}
					placeholder='What is on this media?'
					error={errors.content_type?.message}
					required
				/>

				<MultiSelectDropdown
					label='Audio'
					options={dropdownOptions?.languages || []}
					selectedValues={formData.audio}
					onChange={values => setValue('audio', values)}
					placeholder='Select audio languages'
					error={errors.audio?.message}
				/>

				<MultiSelectDropdown
					label='Subtitles'
					options={dropdownOptions?.languages || []}
					selectedValues={formData.subtitles}
					onChange={values => setValue('subtitles', values)}
					placeholder='Select subtitle languages'
					error={errors.subtitles?.message}
				/>
			</div>

			{/* Watched Status - Compact */}
			<div className='space-y-1'>
				<label className='block text-sm font-medium text-gray-300 mb-1'>
					Watched Status
				</label>
				<div className='flex gap-3 max-w-xs'>
					<button
						type='button'
						onClick={() => {
							if (!isGuest) {
								setValue('watched', false);
								setValue('rating', undefined);
							}
						}}
						disabled={isGuest}
						className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
							!formData.watched
								? 'bg-gradient-to-r from-gray-700 to-gray-600 text-white border-2 border-gray-500 shadow-lg'
								: 'bg-gray-800 text-gray-400 border-2 border-gray-700 hover:border-gray-600'
						} ${
							isGuest
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer hover:shadow-md'
						}`}
					>
						No
					</button>
					<button
						type='button'
						onClick={() => !isGuest && setValue('watched', true)}
						disabled={isGuest}
						className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
							formData.watched
								? 'bg-gradient-to-r from-green-700 to-green-600 text-white border-2 border-green-500 shadow-lg'
								: 'bg-gray-800 text-gray-400 border-2 border-gray-700 hover:border-gray-600'
						} ${
							isGuest
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer hover:shadow-md'
						}`}
					>
						Yes
					</button>
				</div>
				{isGuest && (
					<p className='text-xs text-gray-500 mt-1'>
						Read-only for guest users
					</p>
				)}
			</div>

			{/* Rating and Watch Notes - Only shown when watched */}
			{formData.watched && (
				<div className='bg-green-900/10 border border-green-700/30 rounded-lg p-3'>
					<div className='space-y-3'>
						{/* Rating - Prominent display */}
						<div className='space-y-2'>
							<label className='block text-sm font-medium text-gray-300'>
								Rating <span className='text-red-400'>*</span>
							</label>
							<div className='flex gap-2'>
								{[1, 2, 3, 4, 5].map(star => (
									<button
										key={star}
										type='button'
										onClick={() => !isGuest && setValue('rating', star)}
										disabled={isGuest}
										className={`p-2 rounded-lg transition-all duration-200 ${
											isGuest
												? 'opacity-50 cursor-not-allowed'
												: 'cursor-pointer hover:bg-gray-700'
										}`}
									>
										{formData.rating && formData.rating >= star ? (
											<StarIconSolid className='h-8 w-8 text-yellow-400' />
										) : (
											<StarIcon className='h-8 w-8 text-gray-500' />
										)}
									</button>
								))}
							</div>
							{errors.rating && (
								<p className='text-sm text-red-400 flex items-center gap-1'>
									<span className='w-1 h-1 bg-red-400 rounded-full'></span>
									{errors.rating.message}
								</p>
							)}
						</div>

						{/* Watch Notes - Compact single line input */}
						<div className='space-y-1'>
							<label className='block text-xs font-medium text-gray-400'>
								Watch Notes (optional)
							</label>
							<input
								{...register('watch_notes')}
								type='text'
								placeholder='Quick thoughts about this item...'
								disabled={isGuest}
								className='bg-gray-900 backdrop-blur-sm border border-gray-600 rounded-lg px-3 py-2 text-white text-sm transition-all duration-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-gray-900/95 placeholder:text-gray-500 w-full disabled:opacity-50 disabled:cursor-not-allowed'
							/>
							{errors.watch_notes && (
								<p className='text-xs text-red-400 flex items-center gap-1'>
									<span className='w-1 h-1 bg-red-400 rounded-full'></span>
									{errors.watch_notes.message}
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Notes and Additional Media */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<div className='space-y-1'>
					<label className='block text-sm font-medium text-gray-300'>
						Notes
					</label>
					<textarea
						{...register('notes')}
						placeholder='Additional notes about this media...'
						rows={2}
						className='bg-gray-900 backdrop-blur-sm border border-gray-600 rounded-lg px-3 py-2 text-white transition-all duration-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-gray-900/95 placeholder:text-gray-400/80 w-full resize-none'
					/>
					{errors.notes && (
						<p className='text-sm text-red-400 flex items-center gap-1'>
							<span className='w-1 h-1 bg-red-400 rounded-full'></span>
							{errors.notes.message}
						</p>
					)}
				</div>

				<div className='space-y-1'>
					<label className='block text-sm font-medium text-gray-300'>
						Additional Media
					</label>
					<textarea
						{...register('additional_media')}
						placeholder='Extra content included (e.g., behind-the-scenes, deleted scenes)...'
						rows={2}
						className='bg-gray-900 backdrop-blur-sm border border-gray-600 rounded-lg px-3 py-2 text-white transition-all duration-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-gray-900/95 placeholder:text-gray-400/80 w-full resize-none'
					/>
					{errors.additional_media && (
						<p className='text-sm text-red-400 flex items-center gap-1'>
							<span className='w-1 h-1 bg-red-400 rounded-full'></span>
							{errors.additional_media.message}
						</p>
					)}
				</div>
			</div>

			{/* Advanced Fields Toggle */}
			<div className='border-t-2 border-gray-600 pt-6'>
				<button
					type='button'
					onClick={() => setShowAdvancedFields(!showAdvancedFields)}
					className='flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer'
				>
					{showAdvancedFields ? (
						<ChevronUpIcon className='h-5 w-5' />
					) : (
						<ChevronDownIcon className='h-5 w-5' />
					)}
					<span className='text-sm font-medium'>
						{showAdvancedFields ? 'Hide' : 'Show'} Advanced Options
					</span>
				</button>
			</div>

			{/* Advanced Fields */}
			{showAdvancedFields && (
				<div className='space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						<Dropdown
							label='Edition'
							options={dropdownOptions?.editions || []}
							value={formData.edition}
							onChange={value => setValue('edition', value)}
							placeholder='Select edition'
							error={errors.edition?.message}
						/>

						<Dropdown
							label='Availability'
							options={dropdownOptions?.availability || []}
							value={formData.availability}
							onChange={value => setValue('availability', value)}
							placeholder='Select availability status'
							error={errors.availability?.message}
							required
						/>

						<Input
							label='EAN'
							{...register('ean')}
							placeholder='Enter EAN code'
							error={errors.ean?.message}
							pattern='\d*'
							onInput={e => {
								const target = e.target as HTMLInputElement;
								target.value = target.value.replace(/[^\d]/g, '');
							}}
						/>
					</div>
				</div>
			)}

			{/* Form Actions */}
			<div className='flex space-x-3 justify-end'>
				{onCancel && (
					<Button variant='secondary' type='button' onClick={onCancel}>
						Cancel
					</Button>
				)}
				<Button
					type='submit'
					loading={isLoading || isSubmitting}
					disabled={!formData.title || !formData.media_type || isSubmitting}
				>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
