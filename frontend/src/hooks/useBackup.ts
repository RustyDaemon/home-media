import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { apiClient } from '../api/client';

// Mutation: Create database backup (SQL dump)
export function useCreateDatabaseBackup() {
	return useMutation<{ sql_dump: string }, Error>({
		mutationFn: () => apiClient.createDatabaseBackup(),
		onSuccess: () => {
			toast.success('Database backup created successfully');
		},
		onError: error => {
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to create database backup'
			);
		},
	});
}

// Mutation: Create file backup
export function useCreateFileBackup() {
	return useMutation<{ backup_filename: string }, Error>({
		mutationFn: () => apiClient.createFileBackup(),
		onSuccess: data => {
			toast.success(`File backup created: ${data.backup_filename}`);
		},
		onError: error => {
			toast.error(
				error instanceof Error ? error.message : 'Failed to create file backup'
			);
		},
	});
}

// Mutation: Export media to CSV
export function useExportMediaToCSV() {
	return useMutation<Blob, Error>({
		mutationFn: () => apiClient.exportMediaToCSV(),
		onSuccess: blob => {
			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `media-export-${
				new Date().toISOString().split('T')[0]
			}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			toast.success('Media exported to CSV successfully');
		},
		onError: error => {
			toast.error(
				error instanceof Error ? error.message : 'Failed to export media to CSV'
			);
		},
	});
}
