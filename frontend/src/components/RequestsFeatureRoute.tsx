import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRequestsStatus } from '../hooks/useRequestsStatus';

interface RequestsFeatureRouteProps {
	children: ReactNode;
}

export function RequestsFeatureRoute({ children }: RequestsFeatureRouteProps) {
	const { data: requestsEnabled = false, isLoading } = useRequestsStatus();

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<div className='text-gray-400'>Loading...</div>
			</div>
		);
	}

	if (!requestsEnabled) {
		return <Navigate to='/' replace />;
	}

	return <>{children}</>;
}
