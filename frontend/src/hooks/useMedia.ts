import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient } from '../api/client';
import type { MediaFormData } from '../schemas/media';
import type {
	DropdownOptions,
	MediaListParams,
	MediaListResponse,
	MediaStats,
	MediaSummary,
} from '../types/media';

// Query: Get a page of media (server-side search/filter/sort/pagination)
export function useMediaList(params: MediaListParams) {
	return useQuery<MediaListResponse>({
		queryKey: ['media', 'list', params],
		queryFn: () => apiClient.getMedia(params),
		placeholderData: keepPreviousData,
	});
}

// Query: Get media by ID
export function useMediaById(id: number) {
	return useQuery<MediaSummary>({
		queryKey: ['media', id],
		queryFn: () => apiClient.getMediaById(id),
		enabled: !!id && id > 0,
	});
}

// Query: Get dropdown options
export function useDropdownOptions() {
	return useQuery<DropdownOptions>({
		queryKey: ['dropdown-options'],
		queryFn: () => apiClient.getDropdownOptions(),
		staleTime: 10 * 60 * 1000, // 10 minutes (dropdown options rarely change)
	});
}

// Query: Get statistics
export function useMediaStats() {
	return useQuery<MediaStats>({
		queryKey: ['stats'],
		queryFn: () => apiClient.getStats(),
	});
}

// Query: Get random unwatched media
export function useRandomUnwatched() {
	return useQuery<MediaSummary>({
		queryKey: ['media', 'random-unwatched'],
		queryFn: () => apiClient.getRandomUnwatched(),
		enabled: false, // Only fetch when manually triggered
		retry: false,
	});
}

// Mutation: Create media
export function useCreateMedia() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation<MediaSummary, Error, MediaFormData>({
		mutationFn: data => apiClient.createMedia(data),
		onSuccess: newMedia => {
			queryClient.invalidateQueries({ queryKey: ['media'] });
			queryClient.invalidateQueries({ queryKey: ['stats'] });
			toast.success(`"${newMedia.title}" has been added successfully!`);
			navigate('/');
		},
		onError: error => {
			toast.error(
				error instanceof Error ? error.message : 'Failed to create media'
			);
		},
	});
}

// Mutation: Update media
export function useUpdateMedia(id: number) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation<MediaSummary, Error, MediaFormData>({
		mutationFn: data => apiClient.updateMedia(id, data),
		onSuccess: updatedMedia => {
			queryClient.invalidateQueries({ queryKey: ['media'] });
			queryClient.invalidateQueries({ queryKey: ['media', id] });
			queryClient.invalidateQueries({ queryKey: ['stats'] });
			toast.success(`"${updatedMedia.title}" has been updated successfully!`);
			navigate('/');
		},
		onError: error => {
			toast.error(
				error instanceof Error ? error.message : 'Failed to update media'
			);
		},
	});
}

// Mutation: Delete media
export function useDeleteMedia() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { id: number; title: string }>({
		mutationFn: ({ id }) => apiClient.deleteMedia(id),
		onSuccess: (_, { title }) => {
			queryClient.invalidateQueries({ queryKey: ['media'] });
			queryClient.invalidateQueries({ queryKey: ['stats'] });
			toast.success(`"${title}" has been deleted successfully!`);
		},
		onError: error => {
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete media'
			);
		},
	});
}

// Mutation: Bulk delete media
export function useBulkDeleteMedia() {
	const queryClient = useQueryClient();

	return useMutation<{ deleted: number }, Error, number[]>({
		mutationFn: ids => apiClient.bulkDeleteMedia(ids),
		onSuccess: ({ deleted }) => {
			queryClient.invalidateQueries({ queryKey: ['media'] });
			queryClient.invalidateQueries({ queryKey: ['stats'] });
			toast.success(
				`${deleted} item${deleted === 1 ? '' : 's'} deleted successfully!`
			);
		},
		onError: error => {
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete media'
			);
		},
	});
}

// Mutation: Bulk set watched status
export function useBulkSetWatched() {
	const queryClient = useQueryClient();

	return useMutation<
		{ updated: number },
		Error,
		{ ids: number[]; watched: boolean }
	>({
		mutationFn: ({ ids, watched }) => apiClient.bulkSetWatched(ids, watched),
		onSuccess: ({ updated }, { watched }) => {
			queryClient.invalidateQueries({ queryKey: ['media'] });
			queryClient.invalidateQueries({ queryKey: ['stats'] });
			toast.success(
				`${updated} item${updated === 1 ? '' : 's'} marked as ${
					watched ? 'watched' : 'unwatched'
				}!`
			);
		},
		onError: error => {
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to update watched status'
			);
		},
	});
}

// Mutation: Toggle watched status
export function useToggleWatched() {
	const queryClient = useQueryClient();

	return useMutation<MediaSummary, Error, number>({
		mutationFn: id => apiClient.toggleWatched(id),
		onSuccess: updatedMedia => {
			queryClient.invalidateQueries({ queryKey: ['media'] });
			queryClient.invalidateQueries({ queryKey: ['media', updatedMedia.id] });
			queryClient.invalidateQueries({ queryKey: ['stats'] });
		},
		onError: error => {
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to update watched status'
			);
		},
	});
}
