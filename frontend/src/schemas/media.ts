import { z } from 'zod';

const baseMediaSchema = z.object({
	media_type: z.number().min(1, 'Media type is required'),
	content_type: z.number().min(1, 'Content type is required'),
	availability: z.number().min(1, 'Availability is required'),
	title: z
		.string()
		.min(1, 'Title is required')
		.max(255, 'Title must be less than 255 characters'),
	ean: z.string().regex(/^\d*$/, 'EAN must contain only digits').optional(),
	audio: z.array(z.number()),
	subtitles: z.array(z.number()),
	edition: z.number().min(1, 'Edition is required'),
	notes: z.string().optional(),
	additional_media: z.string().optional(),
	watched: z.boolean().optional(),
	rating: z.number().int().min(1).max(5).optional(),
	watch_notes: z.string().optional(),
});

export const mediaSchema = baseMediaSchema.refine(
	data => {
		// If watched is true, rating is required
		if (data.watched && !data.rating) {
			return false;
		}
		return true;
	},
	{
		message: 'Rating is required for watched items',
		path: ['rating'],
	}
);

export type MediaFormData = z.infer<typeof mediaSchema>;

export const mediaResponseSchema = baseMediaSchema.extend({
	id: z.number(),
	created_at: z.string(),
	updated_at: z.string(),
});

export type Media = z.infer<typeof mediaResponseSchema>;
