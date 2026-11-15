export interface DropdownOption {
	id: number;
	value: string;
	label: string;
	flag?: string; // For subtitle options
}

export interface MediaSummary {
	id: number;
	title: string;
	ean?: string;
	created_at: number;
	updated_at: number;
	notes?: string;
	additional_media?: string;
	media_type_id: number;
	content_type_id: number;
	availability_id: number;
	edition_id: number;
	audio_ids: number[];
	subtitle_ids: number[];
	watched: boolean;
	rating?: number;
	watch_notes?: string;
}

export type MediaSortField =
	| 'title'
	| 'media_type'
	| 'availability'
	| 'created_at'
	| 'updated_at'
	| 'ean';

export interface MediaListParams {
	search?: string;
	sortBy?: MediaSortField;
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
	type?: number;
	status?: number;
	language?: number;
}

export interface MediaListResponse {
	items: MediaSummary[];
	total: number;
	page: number;
	limit: number;
}

export interface Media {
	id: number;
	created_at: number; // Unix timestamp
	updated_at: number; // Unix timestamp
	media_type: DropdownOption;
	content_type: DropdownOption;
	availability: DropdownOption;
	title: string;
	ean?: string;
	audio: DropdownOption[];
	subtitles: DropdownOption[];
	edition: DropdownOption;
	notes?: string;
	additional_media?: string;
	watched: boolean;
	rating?: number;
	watch_notes?: string;
}

export interface DropdownOptions {
	media_types: DropdownOption[];
	content_types: DropdownOption[];
	availability: DropdownOption[];
	languages: DropdownOption[];
	editions: DropdownOption[];
}

export interface MediaStats {
	total_count: number;
	watched_count: number;
	media_type_counts: Array<{
		media_type: string;
		count: number;
	}>;
}
