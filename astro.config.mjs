// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const siteUrl = 'https://prajapati-kaushik.github.io';

export default defineConfig({
	site: siteUrl,
	base: '/',
	trailingSlash: 'always',
	output: 'static',
	integrations: [sitemap()],
});
