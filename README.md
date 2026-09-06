# Kaushik Prajapati — personal portfolio

Static Astro site for **Kaushik Prajapati**, Senior Backend Engineer (PHP & Symfony). Content lives in Markdown. The visual design is adapted from [Astro Keel](https://kpab.github.io/astro-keel/) (MIT, © 2026 kpab).

## Tech stack

- Astro (static)
- TypeScript
- Markdown content collections
- [Astro Keel](https://github.com/kpab/astro-keel) visual system
- GitHub Actions → GitHub Pages

## Local development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Theme

The site uses **Astro Keel**: editorial type (Fraunces + Public Sans), hairline “keel” rules, and a single accent color. Light and dark mode follow system preference and can be toggled in the header.

Retune the palette by changing `--color-accent` in `src/styles/keel.css`.

## Content management

Portfolio copy is not hard-coded in components.

| Content | Location |
| --- | --- |
| Site name, hero, nav, expertise | `src/data/site.ts` |
| Projects | `src/content/projects/*.md` |
| Experience | `src/content/experience/*.md` |
| Notes | `src/content/articles/*.md` |
| About page | `src/content/pages/about.md` |
| Featured GitHub repos | `githubProjects` in `src/data/site.ts` |

To add a project: create a Markdown file under `src/content/projects/`, set `featured: true` to show it on the homepage, then commit and push.

## GitHub integration

Featured repositories are fetched at **build time** from the GitHub API. If the API is unavailable, the site still builds using fallback links. The browser does not call GitHub.

## Deployment

Push to `main`. GitHub Actions builds the static site and deploys to GitHub Pages.

Production URL and base path are set in `astro.config.mjs` (`site` and `base`) so a custom domain can replace GitHub Pages later without rewriting components.

## Project structure

```text
src/
  components/     presentation
  content/        Markdown collections
  data/           site.ts, theme.ts
  layouts/
  pages/
  styles/themes/  one file per visual theme
```
