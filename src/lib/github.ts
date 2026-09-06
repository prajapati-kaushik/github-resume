export type GithubAchievement = {
	slug: string;
	name: string;
	imageUrl: string | null;
	url: string;
};

export type GithubProfile = {
	publicRepos: number;
	pullRequests: number | null;
	mergedPullRequests: number | null;
	yearsActive: number;
	company: string | null;
	languages: string[];
};

export type GithubRepository = {
	name: string;
	fullName: string;
	description: string;
	htmlUrl: string;
	stars: number;
	forks: number;
	language: string | null;
	pushedAt: string | null;
	isFork: boolean;
	mergedPullRequests: number | null;
	parent: { fullName: string; htmlUrl: string; stars: number } | null;
};

export type GithubSnapshot = {
	profile: GithubProfile;
	achievements: GithubAchievement[];
	repos: GithubRepository[];
	fetchedAt: string | null;
};

type GithubApiUser = {
	public_repos: number;
	created_at: string;
	company: string | null;
};

type GithubApiRepo = {
	name: string;
	full_name?: string;
	description: string | null;
	html_url: string;
	stargazers_count: number;
	forks_count: number;
	language: string | null;
	pushed_at: string | null;
	fork: boolean;
	archived?: boolean;
	parent?: {
		full_name: string;
		html_url: string;
		stargazers_count: number;
		language: string | null;
	};
};

type GithubApiSearch = {
	total_count: number;
	items?: GithubApiSearchItem[];
};

type GithubApiSearchItem = {
	repository_url: string;
};

type GithubProfilePage = {
	achievements: GithubAchievement[];
	publicRepos: number;
	yearsActive: number;
	company: string | null;
};

const API = 'https://api.github.com';
const USER_AGENT = 'KaushikPrajapatiResume (https://github.com/prajapati-kaushik)';

function githubToken() {
	const token = process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'];
	return typeof token === 'string' && token.length > 8 ? token : '';
}

function authHeaders(withToken = true): HeadersInit {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': USER_AGENT,
	};
	if (withToken && githubToken()) {
		headers.Authorization = `Bearer ${githubToken()}`;
	}
	return headers;
}

async function githubJson<T>(path: string): Promise<T | null> {
	try {
		let response = await fetch(`${API}${path}`, { headers: authHeaders() });
		if ((response.status === 401 || response.status === 403) && githubToken()) {
			response = await fetch(`${API}${path}`, { headers: authHeaders(false) });
		}
		if (!response.ok) {
			console.warn(`[github] ${path} -> HTTP ${response.status}`);
			return null;
		}
		return (await response.json()) as T;
	} catch (error) {
		console.warn(`[github] ${path} failed:`, (error as Error).message);
		return null;
	}
}

function yearsSince(iso: string) {
	const start = new Date(iso);
	if (Number.isNaN(start.getTime())) {
		return 0;
	}
	const now = new Date();
	let years = now.getFullYear() - start.getFullYear();
	const monthDelta = now.getMonth() - start.getMonth();
	if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < start.getDate())) {
		years -= 1;
	}
	return Math.max(0, years);
}

function fallbackRepo(
	username: string,
	name: string,
	details: Partial<GithubRepository> = {},
): GithubRepository {
	return {
		name,
		fullName: details.fullName ?? `${username}/${name}`,
		description: details.description ?? 'Public repository on GitHub.',
		htmlUrl: details.htmlUrl ?? `https://github.com/${username}/${name}`,
		stars: details.stars ?? 0,
		forks: details.forks ?? 0,
		language: details.language ?? null,
		pushedAt: details.pushedAt ?? null,
		isFork: details.isFork ?? false,
		mergedPullRequests: details.mergedPullRequests ?? null,
		parent: details.parent ?? null,
	};
}

function mapRepo(repo: GithubApiRepo, extras: { mergedPullRequests?: number } = {}): GithubRepository {
	const parent = repo.parent
		? {
				fullName: repo.parent.full_name,
				htmlUrl: repo.parent.html_url,
				stars: repo.parent.stargazers_count,
			}
		: null;

	return {
		name: repo.name,
		fullName: repo.full_name ?? repo.name,
		description: repo.description ?? 'Public repository on GitHub.',
		htmlUrl: repo.html_url,
		stars: repo.stargazers_count,
		forks: repo.forks_count,
		language: repo.language ?? repo.parent?.language ?? null,
		pushedAt: repo.pushed_at,
		isFork: Boolean(repo.fork),
		mergedPullRequests: extras.mergedPullRequests ?? null,
		parent,
	};
}

async function fetchProfilePage(username: string): Promise<GithubProfilePage> {
	const empty: GithubProfilePage = {
		achievements: [],
		publicRepos: 0,
		yearsActive: 0,
		company: null,
	};

	try {
		const response = await fetch(`https://github.com/${username}?tab=achievements`, {
			headers: {
				Accept: 'text/html',
				'User-Agent': USER_AGENT,
			},
		});
		if (!response.ok) {
			return empty;
		}

		const html = await response.text();
		const seen = new Set<string>();
		const achievements: GithubAchievement[] = [];
		const card =
			/<img src="(https:\/\/github\.githubassets\.com\/assets\/[^"]+)" width="90" alt="Achievement: ([^"]+)"[^>]*class="achievement-badge-card"/g;

		for (const match of html.matchAll(card)) {
			const imageUrl = match[1];
			const name = match[2];
			const file = imageUrl.split('/').pop() ?? '';
			const slug = file.replace(/-default-[a-f0-9]+\.png$/i, '');
			if (!slug || seen.has(slug)) {
				continue;
			}
			seen.add(slug);
			achievements.push({
				slug,
				name,
				imageUrl,
				url: `https://github.com/${username}?achievement=${slug}&tab=achievements`,
			});
		}

		const repoCount = html.match(
			/href="\/[^"]+\?tab=repositories"[^>]*>[\s\S]{0,240}?(\d[\d,]*)[\s\S]{0,80}?repositor/i,
		);
		const joined = html.match(/datetime="(\d{4}-\d{2}-\d{2}[^"]*)"/);
		const company = html.match(/itemprop="worksFor"[\s\S]{0,200}?>\s*@?([A-Za-z0-9._-]+)/);

		return {
			achievements,
			publicRepos: repoCount ? Number(repoCount[1].replace(/,/g, '')) : 0,
			yearsActive: joined ? yearsSince(joined[1]) : 0,
			company: company ? `@${company[1]}` : null,
		};
	} catch (error) {
		console.warn('[github] profile page fetch failed:', (error as Error).message);
		return empty;
	}
}

async function fetchSearchCount(query: string): Promise<number | null> {
	const data = await githubJson<GithubApiSearch>(
		`/search/issues?q=${encodeURIComponent(query)}&per_page=1`,
	);
	return data?.total_count ?? null;
}

async function fetchMergedContributionRepos(
	username: string,
	org: string,
	limit: number,
): Promise<GithubRepository[]> {
	const counts = new Map<string, number>();

	for (let page = 1; page <= 3; page += 1) {
		const data = await githubJson<GithubApiSearch>(
			`/search/issues?q=${encodeURIComponent(`author:${username} type:pr org:${org} is:merged`)}&per_page=100&page=${page}`,
		);
		if (!data?.items?.length) {
			break;
		}
		for (const item of data.items) {
			const fullName = item.repository_url.replace('https://api.github.com/repos/', '');
			counts.set(fullName, (counts.get(fullName) ?? 0) + 1);
		}
		if (data.items.length < 100) {
			break;
		}
	}

	const ranked = [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit);

	const details = await Promise.all(
		ranked.map(([fullName]) => githubJson<GithubApiRepo>(`/repos/${fullName}`)),
	);

	return ranked.flatMap(([fullName, mergedPullRequests], index) => {
		const repo = details[index];
		return repo ? [mapRepo(repo, { mergedPullRequests })] : [];
	});
}

function ownOriginalRepos(listed: GithubApiRepo[], exclude: string[]) {
	const skip = new Set(exclude.map((name) => name.toLowerCase()));
	return listed
		.filter((repo) => {
			if (repo.fork || repo.archived) {
				return false;
			}
			if (skip.has(repo.name.toLowerCase())) {
				return false;
			}
			if (repo.name.toLowerCase().endsWith('.github.io')) {
				return false;
			}
			return true;
		})
		.sort((a, b) => {
			const starDelta = b.stargazers_count - a.stargazers_count;
			if (starDelta !== 0) {
				return starDelta;
			}
			return Date.parse(b.pushed_at ?? '') - Date.parse(a.pushed_at ?? '');
		})
		.map((repo) => mapRepo(repo));
}

async function listPublicRepos(username: string): Promise<GithubApiRepo[]> {
	const repos: GithubApiRepo[] = [];
	for (let page = 1; page <= 3; page += 1) {
		const batch = await githubJson<GithubApiRepo[]>(
			`/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
		);
		if (!batch?.length) {
			break;
		}
		repos.push(...batch);
		if (batch.length < 100) {
			break;
		}
	}
	return repos;
}

function topLanguages(repos: GithubApiRepo[], limit = 5) {
	const counts = new Map<string, number>();
	for (const repo of repos) {
		if (!repo.language) {
			continue;
		}
		counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
	}
	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([language]) => language);
}

export function formatGithubDate(value: string | null) {
	if (!value) {
		return null;
	}
	return new Date(value).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export function formatGithubCount(value: number) {
	return new Intl.NumberFormat('en-GB').format(value);
}

export type GithubFeaturedConfig = {
	limit?: number;
	org?: string;
	exclude?: string[];
};

export async function getGithubSnapshot(
	username: string,
	featured: GithubFeaturedConfig = {},
): Promise<GithubSnapshot> {
	const limit = featured.limit ?? 6;
	const org = featured.org ?? 'linkorb';
	const exclude = featured.exclude ?? [];

	const [user, listed, pullRequests, mergedPullRequests, page, contributions] = await Promise.all([
		githubJson<GithubApiUser>(`/users/${username}`),
		listPublicRepos(username),
		fetchSearchCount(`author:${username} type:pr`),
		fetchSearchCount(`author:${username} type:pr is:merged`),
		fetchProfilePage(username),
		fetchMergedContributionRepos(username, org, limit),
	]);

	const originals = ownOriginalRepos(listed, exclude);
	const seen = new Set(originals.map((repo) => repo.fullName.toLowerCase()));
	const repos = [...originals];

	for (const repo of contributions) {
		if (repos.length >= limit) {
			break;
		}
		if (seen.has(repo.fullName.toLowerCase()) || seen.has(repo.name.toLowerCase())) {
			continue;
		}
		seen.add(repo.fullName.toLowerCase());
		repos.push(repo);
	}

	const fillers = [
		fallbackRepo(username, 'php-conventions', {
			description: 'PHP coding conventions.',
			language: 'PHP',
		}),
		fallbackRepo(username, 'version', {
			description: 'Makes it easy for applications to show their own version.',
			language: 'PHP',
		}),
		fallbackRepo('linkorb', 'anonymizer', {
			fullName: 'linkorb/anonymizer',
			htmlUrl: 'https://github.com/linkorb/anonymizer',
			description: 'Scrambles confidential production data for use in test environments.',
			language: 'PHP',
		}),
	];

	for (const extra of fillers) {
		if (repos.length >= 3 && repos.length % 3 === 0) {
			break;
		}
		const key = extra.fullName.toLowerCase();
		if (seen.has(key) || seen.has(extra.name.toLowerCase())) {
			continue;
		}
		seen.add(key);
		repos.push(extra);
	}

	return {
		profile: {
			publicRepos: user?.public_repos || listed.length || page.publicRepos,
			pullRequests,
			mergedPullRequests,
			yearsActive: user ? yearsSince(user.created_at) : page.yearsActive,
			company: user?.company ?? page.company,
			languages: topLanguages(listed),
		},
		achievements: page.achievements,
		repos: repos.slice(0, limit),
		fetchedAt: user || page.achievements.length ? new Date().toISOString() : null,
	};
}
