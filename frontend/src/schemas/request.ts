import { z } from 'zod';

export const requestSchema = z
	.object({
		title: z.string(),
		// Deliberately permissive: existing rows hold free text and scheme-less
		// URLs saved before validation existed, and they must stay editable.
		url: z.string(),
		comment: z.string(),
		status: z.enum(['Awaiting', 'Approved', 'Declined', 'Bought']).optional(),
	})
	.refine(data => data.title || data.url, {
		message: 'Either title or URL must be provided',
		path: ['title'],
	});

export type RequestFormData = z.infer<typeof requestSchema>;
