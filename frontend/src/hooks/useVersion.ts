import { useQuery } from '@tanstack/react-query';
import { config } from '../config/env';

export interface VersionInfo {
	current_version: string;
	latest_version: string;
	update_required: boolean;
	checked_at: number;
}

export function useVersion() {
	return useQuery({
		queryKey: ['version'],
		queryFn: async (): Promise<VersionInfo> => {
			const response = await fetch(`${config.apiBaseUrl}/version`);
			if (!response.ok) {
				throw new Error('Failed to fetch version info');
			}
			const data = await response.json();
			return data.data;
		},
		staleTime: 2 * 60 * 60 * 1000, // 2 hours
		refetchInterval: 1 * 60 * 60 * 1000, // Check every 1 hour
		retry: false, // Don't retry on failure
	});
}
