import type {
	DropdownOption,
	DropdownOptions,
	Media,
	MediaSummary,
} from '../types/media';

/**
 * Convert a MediaSummary (compact format) to Media (full format) using dropdown options
 */
export function expandMediaSummary(
	summary: MediaSummary,
	dropdownOptions: DropdownOptions
): Media {
	// Helper function to find option by ID
	const findOption = (
		options: DropdownOption[],
		id: number
	): DropdownOption => {
		const option = options.find(opt => opt.id === id);
		if (!option) {
			return { id, value: 'unknown', label: 'Unknown' };
		}
		return option;
	};

	// Helper function to find multiple options by IDs
	const findOptions = (
		options: DropdownOption[],
		ids: number[]
	): DropdownOption[] => {
		return ids.map(id => findOption(options, id));
	};

	return {
		id: summary.id,
		title: summary.title,
		ean: summary.ean,
		created_at: summary.created_at,
		updated_at: summary.updated_at,
		notes: summary.notes,
		additional_media: summary.additional_media,
		watched: summary.watched,
		rating: summary.rating,
		watch_notes: summary.watch_notes,
		media_type: findOption(dropdownOptions.media_types, summary.media_type_id),
		content_type: findOption(
			dropdownOptions.content_types,
			summary.content_type_id
		),
		availability: findOption(
			dropdownOptions.availability,
			summary.availability_id
		),
		edition: findOption(dropdownOptions.editions, summary.edition_id),
		audio: findOptions(dropdownOptions.languages, summary.audio_ids),
		subtitles: findOptions(dropdownOptions.languages, summary.subtitle_ids),
	};
}

/**
 * Get display label for media type by ID
 */
export function getMediaTypeLabel(
	id: number,
	dropdownOptions: DropdownOptions
): string {
	const mediaType = dropdownOptions.media_types.find(mt => mt.id === id);
	return mediaType?.label || 'Unknown';
}

/**
 * Get display label for content type by ID
 */
export function getContentTypeLabel(
	id: number,
	dropdownOptions: DropdownOptions
): string {
	const contentType = dropdownOptions.content_types.find(ct => ct.id === id);
	return contentType?.label || 'Unknown';
}

/**
 * Get display label for availability by ID
 */
export function getAvailabilityLabel(
	id: number,
	dropdownOptions: DropdownOptions
): string {
	const availability = dropdownOptions.availability.find(a => a.id === id);
	return availability?.label || 'Unknown';
}

/**
 * Get availability option by ID for styling purposes
 */
export function getAvailabilityOption(
	id: number,
	dropdownOptions: DropdownOptions
): DropdownOption | null {
	return dropdownOptions.availability.find(a => a.id === id) || null;
}

/**
 * Get media type option by ID for styling purposes
 */
export function getMediaTypeOption(
	id: number,
	dropdownOptions: DropdownOptions
): DropdownOption | null {
	return dropdownOptions.media_types.find(mt => mt.id === id) || null;
}
