import { z } from 'zod';

export const loginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
	.object({
		old_password: z.string().min(1, 'Current password is required'),
		new_password: z
			.string()
			.min(6, 'Password must be at least 6 characters long'),
		confirm_password: z.string().min(1, 'Please confirm your new password'),
	})
	.refine(data => data.new_password === data.confirm_password, {
		message: 'Passwords do not match',
		path: ['confirm_password'],
	})
	.refine(data => data.new_password !== data.old_password, {
		message: 'New password must be different from the current password',
		path: ['new_password'],
	});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
