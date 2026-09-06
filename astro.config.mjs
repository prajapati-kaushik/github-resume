// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const siteUrl = 'https://prajapati-kaushik.github.io';
const onGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
	site: siteUrl,
	// Local: http://localhost:4321/  — Pages: https://…github.io/github-resume/
	base: onGitHubPages ? '/github-resume' : '/',
	trailingSlash: 'always',
	output: 'static',
	integrations: [sitemap()],
});
