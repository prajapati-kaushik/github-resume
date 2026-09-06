import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		category: z.string(),
		description: z.string(),
		featured: z.boolean().default(false),
		order: z.number().default(0),
		technologies: z.array(z.string()),
		github: z.string().url().optional(),
		website: z.string().url().optional(),
	}),
});

const articles = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
	}),
});

const experience = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
	schema: z.object({
		company: z.string(),
		role: z.string(),
		startDate: z.string(),
		endDate: z.string().nullable(),
		order: z.number().default(0),
		location: z.string().optional(),
	}),
});

const pages = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		cvUrl: z.string().optional(),
	}),
});

export const collections = {
	projects,
	articles,
	experience,
	pages,
};
