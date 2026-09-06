export type GithubRepository = {
	name: string;
	description: string;
	htmlUrl: string;
	stars: number;
	language: string | null;
	updatedAt: string | null;
};

type GithubApiRepo = {
	name: string;
	description: string | null;
	html_url: string;
	stargazers_count: number;
	language: string | null;
	updated_at: string;
	fork: boolean;
};

async function fetchRepo(username: string, name: string): Promise<GithubRepository | null> {
	try {
		const response = await fetch(`https://api.github.com/repos/${username}/${name}`, {
			headers: { Accept: 'application/vnd.github+json' },
		});

		if (!response.ok) {
			console.warn(`[github] ${username}/${name} -> HTTP ${response.status}`);
			return fallbackRepo(username, name);
		}

		const repo = (await response.json()) as GithubApiRepo;
		return {
			name: repo.name,
			description: repo.description ?? 'Public repository on GitHub.',
			htmlUrl: repo.html_url,
			stars: repo.stargazers_count,
			language: repo.language,
			updatedAt: repo.updated_at,
		};
	} catch (error) {
		console.warn(`[github] fetch failed for ${username}/${name}:`, (error as Error).message);
		return fallbackRepo(username, name);
	}
}

function fallbackRepo(username: string, name: string): GithubRepository {
	return {
		name,
		description: 'Featured public repository.',
		htmlUrl: `https://github.com/${username}/${name}`,
		stars: 0,
		language: null,
		updatedAt: null,
	};
}

export async function getFeaturedGithubRepos(
	username: string,
	names: string[],
): Promise<GithubRepository[]> {
	const repos = await Promise.all(names.map((name) => fetchRepo(username, name)));
	return repos.filter((repo): repo is GithubRepository => repo !== null);
}
