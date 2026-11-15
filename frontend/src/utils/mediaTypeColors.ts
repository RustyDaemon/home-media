import type { DropdownOption } from '../types/media';

/**
 * Get subtle background color classes for media type highlighting
 * Uses very muted colors to maintain usability while providing visual organization
 */
export function getMediaTypeColorClasses(mediaType: DropdownOption): {
	background: string;
	border: string;
} {
	const value = mediaType.value.toLowerCase();

	switch (value) {
		case 'dvd':
			return {
				background: 'bg-orange-950/20',
				border: 'border-orange-900/30',
			};

		case 'bluray':
			return {
				background: 'bg-blue-950/20',
				border: 'border-blue-900/30',
			};

		case 'bluray_4k':
			return {
				background: 'bg-violet-950/20',
				border: 'border-violet-900/30',
			};

		case 'cd':
			return {
				background: 'bg-emerald-950/20',
				border: 'border-emerald-900/30',
			};

		default:
			return {
				background: 'bg-gray-950/20',
				border: 'border-gray-900/30',
			};
	}
}

/**
 * Get hover state color classes that work with the media type base colors
 */
export function getMediaTypeHoverClasses(mediaType: DropdownOption): string {
	const value = mediaType.value.toLowerCase();

	switch (value) {
		case 'dvd':
			return 'hover:bg-orange-900/30';
		case 'bluray':
			return 'hover:bg-blue-900/30';
		case 'bluray_4k':
			return 'hover:bg-violet-900/30';
		case 'cd':
			return 'hover:bg-emerald-900/30';
		default:
			return 'hover:bg-gray-900/30';
	}
}

/**
 * Get a subtle text accent color for small indicators or badges
 */
export function getMediaTypeTextAccent(mediaType: DropdownOption): string {
	const value = mediaType.value.toLowerCase();

	switch (value) {
		case 'dvd':
			return 'text-orange-400/70';
		case 'bluray':
			return 'text-blue-400/70';
		case 'bluray_4k':
			return 'text-violet-400/70';
		case 'cd':
			return 'text-emerald-400/70';
		default:
			return 'text-gray-400/70';
	}
}
