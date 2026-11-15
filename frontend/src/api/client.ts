import { config } from '../config/env';
import type { MediaFormData } from '../schemas/media';
import type {
	DropdownOptions,
	MediaListParams,
	MediaListResponse,
	MediaStats,
	MediaSummary,
} from '../types/media';
import type {
	Request,
	RequestFormData,
	RequestStatusUpdate,
} from '../types/request';

export interface ApiSuccessResponse<T = unknown> {
	success: true;
	data?: T;
	message?: string;
}

export interface ApiErrorResponse {
	success: false;
	error:
		| 'validation'
		| 'not_found'
		| 'internal'
		| 'unauthorized'
		| 'forbidden'
		| 'conflict'
		| 'bad_request'
		| 'too_many_requests'
		| 'password_change_required';
	message: string;
	details?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
	public readonly errorType: string;
	public readonly details?: string;

	constructor(errorResponse: ApiErrorResponse) {
		super(errorResponse.message);
		this.name = 'ApiError';
		this.errorType = errorResponse.error;
		this.details = errorResponse.details;
	}
}

const API_BASE_URL = config.apiBaseUrl;
const TOKEN_KEY = 'mm_media_token';

export const tokenManager = {
	getToken: (): string | null => {
		return localStorage.getItem(TOKEN_KEY);
	},
	setToken: (token: string): void => {
		localStorage.setItem(TOKEN_KEY, token);
	},
	removeToken: (): void => {
		localStorage.removeItem(TOKEN_KEY);
	},
};

export interface LoginRequest {
	username: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	must_change_password: boolean;
	username: string;
	is_guest: boolean;
	default_language_id: number | null;
}

export interface ChangePasswordRequest {
	old_password: string;
	new_password: string;
}

export interface AuthStatusResponse {
	authenticated: boolean;
	must_change_password: boolean;
	username: string;
	is_guest: boolean;
	default_language_id: number | null;
}

export interface UpdateDefaultLanguageRequest {
	default_language_id: number | null;
}

export interface GuestModeStatusResponse {
	enabled: boolean;
}

export interface RequestsStatusResponse {
	enabled: boolean;
}

class ApiClient {
	private async request<T>(
		endpoint: string,
		options?: RequestInit
	): Promise<T> {
		const url = `${API_BASE_URL}${endpoint}`;
		const token = tokenManager.getToken();

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(options?.headers as Record<string, string>),
		};

		// Add Authorization header if token exists (except for login endpoint)
		if (token && !endpoint.includes('/login')) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(url, {
			headers,
			...options,
		});

		// Handle 204 No Content responses (e.g., DELETE operations)
		if (response.status === 204) {
			return undefined as T;
		}

		let responseData: ApiResponse<T>;
		try {
			responseData = await response.json();
		} catch {
			// If JSON parsing fails, throw a generic error
			throw new Error(`Failed to parse response: ${response.statusText}`);
		}

		if (!response.ok || !responseData.success) {
			// Check for unauthorized error and clear token
			if (response.status === 401) {
				tokenManager.removeToken();
			}

			if (responseData.success === false) {
				// This is our standardized error response
				throw new ApiError(responseData);
			} else {
				// Fallback for non-standardized errors (e.g., server down)
				throw new Error(`API request failed: ${response.statusText}`);
			}
		}

		if ('data' in responseData && responseData.data !== undefined) {
			return responseData.data;
		}

		return responseData as unknown as T;
	}

	// Auth operations
	async login(credentials: LoginRequest): Promise<LoginResponse> {
		const response = await this.request<LoginResponse>('/login', {
			method: 'POST',
			body: JSON.stringify(credentials),
		});
		tokenManager.setToken(response.token);
		return response;
	}

	async changePassword(
		data: ChangePasswordRequest
	): Promise<{ message: string; token: string }> {
		const response = await this.request<{ message: string; token: string }>(
			'/auth/change-password',
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
		// Update token after password change
		if (response.token) {
			tokenManager.setToken(response.token);
		}
		return response;
	}

	async getAuthStatus(): Promise<AuthStatusResponse> {
		return this.request<AuthStatusResponse>('/auth/status');
	}

	async updateDefaultLanguage(
		data: UpdateDefaultLanguageRequest
	): Promise<{ message: string; default_language_id: number | null }> {
		return this.request<{
			message: string;
			default_language_id: number | null;
		}>('/auth/default-language', {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async guestLogin(): Promise<LoginResponse> {
		return this.login({ username: 'guest', password: 'guest' });
	}

	async getGuestModeStatus(): Promise<GuestModeStatusResponse> {
		return this.request<GuestModeStatusResponse>('/guest-mode-status');
	}

	async getRequestsStatus(): Promise<RequestsStatusResponse> {
		return this.request<RequestsStatusResponse>('/requests-status');
	}

	logout(): void {
		tokenManager.removeToken();
	}

	// Media CRUD operations
	async getMedia(params: MediaListParams = {}): Promise<MediaListResponse> {
		const searchParams = new URLSearchParams();
		if (params.search) searchParams.append('search', params.search);
		if (params.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
		if (params.page && params.page > 1)
			searchParams.append('page', String(params.page));
		if (params.limit && params.limit > 0)
			searchParams.append('limit', String(params.limit));
		if (params.type) searchParams.append('type', String(params.type));
		if (params.status) searchParams.append('status', String(params.status));
		if (params.language)
			searchParams.append('language', String(params.language));

		const query = searchParams.toString();
		return this.request<MediaListResponse>(
			`/media${query ? `?${query}` : ''}`
		);
	}

	async getMediaById(id: number): Promise<MediaSummary> {
		return this.request<MediaSummary>(`/media/${id}`);
	}

	async createMedia(data: MediaFormData): Promise<MediaSummary> {
		return this.request<MediaSummary>('/media', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateMedia(id: number, data: MediaFormData): Promise<MediaSummary> {
		return this.request<MediaSummary>(`/media/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteMedia(id: number): Promise<void> {
		await this.request(`/media/${id}`, {
			method: 'DELETE',
		});
	}

	async bulkDeleteMedia(ids: number[]): Promise<{ deleted: number }> {
		return this.request<{ deleted: number }>('/media/bulk-delete', {
			method: 'POST',
			body: JSON.stringify({ ids }),
		});
	}

	async bulkSetWatched(
		ids: number[],
		watched: boolean
	): Promise<{ updated: number }> {
		return this.request<{ updated: number }>('/media/bulk-watched', {
			method: 'PATCH',
			body: JSON.stringify({ ids, watched }),
		});
	}

	async getRandomUnwatched(): Promise<MediaSummary> {
		return this.request<MediaSummary>('/media/random/unwatched');
	}

	async toggleWatched(id: number): Promise<MediaSummary> {
		return this.request<MediaSummary>(`/media/${id}/watched`, {
			method: 'PATCH',
		});
	}

	// Dropdown options
	async getDropdownOptions(): Promise<DropdownOptions> {
		return this.request<DropdownOptions>('/dropdown-options');
	}

	// Statistics
	async getStats(): Promise<MediaStats> {
		return this.request<MediaStats>('/stats');
	}

	// System operations
	async createDatabaseBackup(): Promise<{ sql_dump: string }> {
		return this.request<{ sql_dump: string }>('/backup/dump');
	}

	async createFileBackup(): Promise<{ backup_filename: string }> {
		return this.request<{ backup_filename: string }>('/backup/file', {
			method: 'POST',
		});
	}

	// CSV Export
	async exportMediaToCSV(): Promise<Blob> {
		const url = `${API_BASE_URL}/export/csv`;
		const token = tokenManager.getToken();

		const headers: Record<string, string> = {
			Accept: 'text/csv',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(url, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`CSV export failed: ${response.statusText}`);
		}

		return response.blob();
	}

	// Request CRUD operations
	async getRequests(): Promise<Request[]> {
		return this.request<Request[]>('/requests');
	}

	async getRequestById(id: number): Promise<Request> {
		return this.request<Request>(`/requests/${id}`);
	}

	async createRequest(data: RequestFormData): Promise<Request> {
		return this.request<Request>('/requests', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateRequest(id: number, data: RequestFormData): Promise<Request> {
		return this.request<Request>(`/requests/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async updateRequestStatus(
		id: number,
		data: RequestStatusUpdate
	): Promise<Request> {
		return this.request<Request>(`/requests/${id}/status`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		});
	}

	async deleteRequest(id: number): Promise<void> {
		await this.request(`/requests/${id}`, {
			method: 'DELETE',
		});
	}
}

export const apiClient = new ApiClient();
