import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type {
	AuthStatusResponse,
	ChangePasswordRequest,
	GuestModeStatusResponse,
	LoginRequest,
	LoginResponse,
	UpdateDefaultLanguageRequest,
} from '../api/client';
import { apiClient } from '../api/client';

// Query: Get authentication status
export function useAuthStatus() {
	return useQuery<AuthStatusResponse>({
		queryKey: ['auth', 'status'],
		queryFn: () => apiClient.getAuthStatus(),
		retry: false,
	});
}

// Query: Get guest mode status
export function useGuestModeStatus() {
	return useQuery<GuestModeStatusResponse>({
		queryKey: ['guest-mode-status'],
		queryFn: () => apiClient.getGuestModeStatus(),
		retry: 1,
	});
}

// Mutation: Login
export function useLogin() {
	return useMutation<LoginResponse, Error, LoginRequest>({
		mutationFn: credentials => apiClient.login(credentials),
		onError: error => {
			toast.error(
				error instanceof Error
					? error.message
					: 'Login failed. Please check your credentials.'
			);
		},
	});
}

// Mutation: Guest login
export function useGuestLogin() {
	return useMutation<LoginResponse, Error>({
		mutationFn: () => apiClient.guestLogin(),
		onError: error => {
			toast.error(
				error instanceof Error ? error.message : 'Guest login failed'
			);
		},
	});
}

// Mutation: Change password
export function useChangePassword() {
	const queryClient = useQueryClient();

	return useMutation<
		{ message: string; token: string },
		Error,
		ChangePasswordRequest
	>({
		mutationFn: data => apiClient.changePassword(data),
		onSuccess: () => {
			toast.success('Password changed successfully');
			queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
		},
		onError: error => {
			toast.error(
				error instanceof Error ? error.message : 'Failed to change password'
			);
		},
	});
}

// Mutation: Update default language
export function useUpdateDefaultLanguage() {
	const queryClient = useQueryClient();

	return useMutation<
		{ message: string; default_language_id: number | null },
		Error,
		UpdateDefaultLanguageRequest
	>({
		mutationFn: data => apiClient.updateDefaultLanguage(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
			toast.success('Default language updated');
		},
		onError: error => {
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to update default language'
			);
		},
	});
}

// Mutation: Logout (not a real API call, but useful as a mutation for side effects)
export function useLogout() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: () => {
			apiClient.logout();
			return Promise.resolve();
		},
		onSuccess: () => {
			queryClient.clear(); // Clear all cache
			navigate('/login');
		},
	});
}
