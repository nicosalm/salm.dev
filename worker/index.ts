interface Env {
	UPDOWNIO_KEY: string;
	RYBBIT_API_KEY: string;
	RYBBIT_SITE_ID: string;
	CF_API_TOKEN: string;
	CF_ZONE_ID: string;
}

const URLS = {
	checks: 'https://updown.io/api/checks',
	languages: 'https://wakatime.com/share/@nicosalm/40b9a962-5e32-4bfe-affa-faa33ba90924.json',
	editors: 'https://wakatime.com/share/@nicosalm/994e1f21-7f88-45d0-8171-35c673ad47f5.json',
	activity: 'https://wakatime.com/share/@nicosalm/268fcdb2-fe99-408a-960a-8afde44c6a94.json',
	rybbit: 'https://rybbit.salm.dev',
	cloudflare: 'https://api.cloudflare.com/client/v4/graphql',
};

const TIME_ZONE = 'America/Chicago';
const ALL_TIME_START = '2024-01-01';

function ymd(d: Date): string {
	return d.toISOString().slice(0, 10);
}

async function getJson(url: string, init?: RequestInit): Promise<any> {
	try {
		const r = await fetch(url, init);
		return r.ok ? await r.json() : null;
	} catch {
		return null;
	}
}

async function getStats(env: Env) {
	const end = new Date();
	const start = new Date(end.getTime() - 6 * 86400000);
	const startStr = ymd(start);
	const endStr = ymd(end);
	const tz = encodeURIComponent(TIME_ZONE);
	const auth = { headers: { Authorization: `Bearer ${env.RYBBIT_API_KEY}` } };
	const overviewUrl = (s: string) =>
		`${URLS.rybbit}/api/sites/${env.RYBBIT_SITE_ID}/overview?start_date=${s}&end_date=${endStr}&time_zone=${tz}`;

	const cfQuery = `query($zone:String!,$start:String!,$end:String!){
		viewer { zones(filter:{zoneTag:$zone}) {
			httpRequests1dGroups(limit:7, filter:{date_geq:$start, date_leq:$end}) {
				sum { bytes cachedBytes }
			}
		} }
	}`;

	const [rb, all, cf] = await Promise.all([
		getJson(overviewUrl(startStr), auth),
		getJson(overviewUrl(ALL_TIME_START), auth),
		getJson(URLS.cloudflare, {
			method: 'POST',
			headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: cfQuery, variables: { zone: env.CF_ZONE_ID, start: startStr, end: endStr } }),
		}),
	]);

	const rbData = rb?.data ?? {};
	const allData = all?.data ?? {};

	const groups = cf?.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? [];
	const cfSum = groups.reduce(
		(a: { bytes: number; cachedBytes: number }, g: any) => ({
			bytes: a.bytes + (g.sum.bytes || 0),
			cachedBytes: a.cachedBytes + (g.sum.cachedBytes || 0),
		}),
		{ bytes: 0, cachedBytes: 0 },
	);

	return {
		window: { start: startStr, end: endStr },
		analytics: {
			users: rbData.users ?? 0,
			pageviews: rbData.pageviews ?? 0,
			allUsers: allData.users ?? 0,
			allPageviews: allData.pageviews ?? 0,
		},
		cloudflare: cfSum,
	};
}

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
			const [checksRes, languagesRes, editorsRes, activityRes, stats] = await Promise.all([
				fetch(URLS.checks, {
					headers: { 'X-API-KEY': env.UPDOWNIO_KEY, 'Accept-Encoding': 'gzip' },
				}),
				fetch(URLS.languages),
				fetch(URLS.editors),
				fetch(URLS.activity),
				getStats(env).catch(() => null),
			]);

			const checks = checksRes.ok ? await checksRes.json() : [];
			const languages = languagesRes.ok ? (await languagesRes.json() as any).data : [];
			const editors = editorsRes.ok ? (await editorsRes.json() as any).data : [];
			const activity = activityRes.ok ? (await activityRes.json() as any).data : [];

			const response = new Response(JSON.stringify({ checks, languages, editors, activity, stats }), {
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': `public, max-age=${CACHE_TTL}`,
					...CORS_HEADERS,
				},
			});

			cache.put(cacheKey, response.clone());
			return response;
		} catch {
			return new Response(JSON.stringify({ error: 'Failed to fetch status data' }), {
				status: 502,
				headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
			});
		}
	},
};
