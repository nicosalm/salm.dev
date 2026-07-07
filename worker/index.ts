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

function ymd(d: Date): string {
	return d.toISOString().slice(0, 10);
}

async function getStats(env: Env) {
	const end = new Date();
	const start = new Date(end.getTime() - 6 * 86400000); // 7 calendar days inclusive
	const startStr = ymd(start);
	const endStr = ymd(end);

	const rybbit = fetch(
		`${URLS.rybbit}/api/sites/${env.RYBBIT_SITE_ID}/overview` +
			`?start_date=${startStr}&end_date=${endStr}&time_zone=${encodeURIComponent(TIME_ZONE)}`,
		{ headers: { Authorization: `Bearer ${env.RYBBIT_API_KEY}` } },
	)
		.then((r) => (r.ok ? (r.json() as Promise<any>) : null))
		.catch(() => null);

	// All-time weekly buckets, for the best-week (max) figures. Rybbit dedupes
	// uniques within each bucket, so max weekly `users` is an accurate peak.
	const rybbitPeak = fetch(
		`${URLS.rybbit}/api/sites/${env.RYBBIT_SITE_ID}/overview/time-series` +
			`?start_date=2024-01-01&end_date=${endStr}&time_zone=${encodeURIComponent(TIME_ZONE)}&bucket=week`,
		{ headers: { Authorization: `Bearer ${env.RYBBIT_API_KEY}` } },
	)
		.then((r) => (r.ok ? (r.json() as Promise<any>) : null))
		.catch(() => null);

	const cfQuery = `query($zone:String!,$start:String!,$end:String!){
		viewer { zones(filter:{zoneTag:$zone}) {
			httpRequests1dGroups(limit:7, orderBy:[date_ASC], filter:{date_geq:$start, date_leq:$end}) {
				sum { bytes cachedBytes }
			}
		} }
	}`;
	const cloudflare = fetch(URLS.cloudflare, {
		method: 'POST',
		headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ query: cfQuery, variables: { zone: env.CF_ZONE_ID, start: startStr, end: endStr } }),
	})
		.then((r) => (r.ok ? (r.json() as Promise<any>) : null))
		.catch(() => null);

	const [rb, peak, cf] = await Promise.all([rybbit, rybbitPeak, cloudflare]);

	const rbData = rb?.data ?? {};
	const weeks: any[] = peak?.data ?? [];
	const maxUsers = weeks.reduce((m, b) => Math.max(m, b.users || 0), 0);
	const maxPageviews = weeks.reduce((m, b) => Math.max(m, b.pageviews || 0), 0);

	const groups = cf?.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? [];
	const cfSum = groups.reduce(
		(a: { bytes: number; cachedBytes: number }, g: any) => ({
			bytes: a.bytes + (g.sum.bytes || 0),
			cachedBytes: a.cachedBytes + (g.sum.cachedBytes || 0),
		}),
		{ bytes: 0, cachedBytes: 0 },
	);

	return {
		window: { start: startStr, end: endStr, days: 7 },
		analytics: {
			users: rbData.users ?? 0,
			pageviews: rbData.pageviews ?? 0,
			maxUsers,
			maxPageviews,
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
