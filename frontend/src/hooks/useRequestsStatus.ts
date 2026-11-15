import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function useRequestsStatus() {
	return useQuery({
		queryKey: ['requestsStatus'],
		queryFn: async () => {
			try {
				const response = await apiClient.getRequestsStatus();
				return response.enabled;
			} catch {
				// If the endpoint fails, assume requests are disabled
				return false;
			}
		},
		staleTime: 1 * 60 * 1000, // 1 minute
	});
}
