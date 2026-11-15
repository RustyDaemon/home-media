import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ApiError, apiClient } from '../api/client';
import type {
	Request,
	RequestFormData,
	RequestStatusUpdate,
} from '../types/request';

export function useRequests() {
	return useQuery<Request[], Error>({
		queryKey: ['requests'],
		queryFn: async () => {
			try {
				return await apiClient.getRequests();
			} catch (error) {
				if (error instanceof ApiError) {
					throw new Error(error.message);
				}
				throw error;
			}
		},
	});
}

export function useCreateRequest() {
	const queryClient = useQueryClient();

	return useMutation<Request, Error, RequestFormData>({
		mutationFn: async (data: RequestFormData) => {
			// Validate that at least title or URL is provided
			if (!data.title && !data.url) {
				throw new Error('Either title or URL must be provided');
			}
			return await apiClient.createRequest(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['requests'] });
			toast.success('Request created successfully!');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create request');
		},
	});
}

export function useUpdateRequest() {
	const queryClient = useQueryClient();

	return useMutation<Request, Error, { id: number; data: RequestFormData }>({
		mutationFn: async ({ id, data }) => {
			// Validate that at least title or URL is provided
			if (!data.title && !data.url) {
				throw new Error('Either title or URL must be provided');
			}
			return await apiClient.updateRequest(id, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['requests'] });
			toast.success('Request updated successfully!');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update request');
		},
	});
}

export function useUpdateRequestStatus() {
	const queryClient = useQueryClient();

	return useMutation<Request, Error, { id: number; data: RequestStatusUpdate }>(
		{
			mutationFn: async ({ id, data }) => {
				return await apiClient.updateRequestStatus(id, data);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['requests'] });
				toast.success('Request status updated successfully!');
			},
			onError: (error: Error) => {
				toast.error(error.message || 'Failed to update request status');
			},
		}
	);
}

export function useDeleteRequest() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: async (id: number) => {
			return await apiClient.deleteRequest(id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['requests'] });
			toast.success('Request deleted successfully!');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to delete request');
		},
	});
}
