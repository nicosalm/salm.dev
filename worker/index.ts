interface Env {
	UPDOWNIO_KEY: string;
}

const URLS = {
	checks: 'https://updown.io/api/checks',
	languages: 'https://wakatime.com/share/@nicosalm/40b9a962-5e32-4bfe-affa-faa33ba90924.json',
	editors: 'https://wakatime.com/share/@nicosalm/994e1f21-7f88-45d0-8171-35c673ad47f5.json',
	activity: 'https://wakatime.com/share/@nicosalm/268fcdb2-fe99-408a-960a-8afde44c6a94.json',
};

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': 'https://salm.dev',
	'Access-Control-Allow-Methods': 'GET',
};

const CACHE_TTL = 60;

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS });
		}

		const cache = caches.default;
		const cacheKey = new Request(request.url, { method: 'GET' });
		const cached = await cache.match(cacheKey);
		if (cached) return cached;

		try {
			const [checksRes, languagesRes, editorsRes, activityRes] = await Promise.all([
				fetch(URLS.checks, {
					headers: { 'X-API-KEY': env.UPDOWNIO_KEY, 'Accept-Encoding': 'gzip' },
				}),
				fetch(URLS.languages),
				fetch(URLS.editors),
				fetch(URLS.activity),
			]);

			const checks = checksRes.ok ? await checksRes.json() : [];
			const languages = languagesRes.ok ? (await languagesRes.json() as any).data : [];
			const editors = editorsRes.ok ? (await editorsRes.json() as any).data : [];
			const activity = activityRes.ok ? (await activityRes.json() as any).data : [];

			const response = new Response(JSON.stringify({ checks, languages, editors, activity }), {
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': `public, max-age=${CACHE_TTL}`,
					...CORS_HEADERS,
				},
			});

			request.method === 'GET' && cache.put(cacheKey, response.clone());
			return response;
		} catch {
			return new Response(JSON.stringify({ error: 'Failed to fetch status data' }), {
				status: 502,
				headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
			});
		}
	},
};
