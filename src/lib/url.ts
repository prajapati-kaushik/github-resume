/** Join a site-relative path with Astro's configured base (GitHub Pages project path or `/`). */
export function url(path = '/') {
	const base = import.meta.env.BASE_URL.endsWith('/')
		? import.meta.env.BASE_URL
		: `${import.meta.env.BASE_URL}/`;

	if (path.startsWith('http://') || path.startsWith('https://')) {
		return path;
	}

	if (path.startsWith(base)) {
		return path;
	}

	const clean = path.replace(/^\//, '');
	return `${base}${clean}`;
}

export function absoluteUrl(path = '/') {
	return new URL(url(path), import.meta.env.SITE).href;
}
