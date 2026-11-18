interface Env {
	UPDOWNIO_KEY: string;
	RYBBIT_API_KEY: string;
	RYBBIT_SITE_ID: string;
	CF_API_TOKEN: string;
	CF_ZONE_ID: string;
}

const URLS = {
	checks: 'https://updown.io/api/checks',
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
	const site = `${URLS.rybbit}/api/sites/${env.RYBBIT_SITE_ID}`;
	const pastWeeks = (from: number, to: number) => `past_minutes_start=${from * WEEK_MINUTES}&past_minutes_end=${to * WEEK_MINUTES}`;
	const metricUrl = (parameter: string) => `${site}/metric?parameter=${parameter}&${pastWeeks(1, 0)}&limit=${AUDIENCE_LIMIT}`;

	const cfQuery = `query($zone:String!,$start:String!,$end:String!){
		viewer { zones(filter:{zoneTag:$zone}) {
			httpRequests1dGroups(limit:7, filter:{date_geq:$start, date_leq:$end}) {
				sum { bytes cachedBytes }
			}
		} }
	}`;

	const [rb, prev, all, cf, pages, countries] = await Promise.all([
		getJson(`${site}/overview?${pastWeeks(1, 0)}`, auth),
		getJson(`${site}/overview?${pastWeeks(2, 1)}`, auth),
		getJson(`${site}/overview?start_date=${ALL_TIME_START}&end_date=${endStr}&time_zone=${tz}`, auth),
		getJson(URLS.cloudflare, {
			method: 'POST',
			headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: cfQuery, variables: { zone: env.CF_ZONE_ID, start: startStr, end: endStr } }),
		}),
		getJson(metricUrl('pathname'), auth),
		getJson(metricUrl('country'), auth),
	]);

	const rbData = rb?.data ?? {};
	const prevData = prev?.data ?? {};
	const allData = all?.data ?? {};

	const groups = cf?.data?.viewer?.zones?.[0]?.httpRequests1dGroups;
	const cfSum = groups
		? groups.reduce(
			(a: { bytes: number; cachedBytes: number }, g: any) => ({
				bytes: a.bytes + (g.sum?.bytes || 0),
				cachedBytes: a.cachedBytes + (g.sum?.cachedBytes || 0),
			}),
			{ bytes: 0, cachedBytes: 0 },
		)
		: null;

	const audience = {
		pages: metricRows(pages),
		countries: metricRows(countries),
	};

	return {
		analytics: {
			users: rbData.users ?? null,
			pageviews: rbData.pageviews ?? null,
			prevUsers: prevData.users ?? null,
			prevPageviews: prevData.pageviews ?? null,
			duration: rbData.session_duration ?? null,
			prevDuration: prevData.session_duration ?? null,
			pagesPerVisit: rbData.pages_per_session ?? null,
			allUsers: allData.users ?? null,
			allPageviews: allData.pageviews ?? null,
		},
		cloudflare: cfSum,
		audience,
		partial: !rb || !prev || !all || !cfSum || Object.values(audience).some((r) => !r),
	};
}

function metricRows(res: any) {
	const list = Array.isArray(res?.data) ? res.data : res?.data?.data;
	return Array.isArray(list)
		? list.slice(0, AUDIENCE_LIMIT).map((m: any) => ({ value: m.value, percentage: m.percentage ?? null }))
		: null;
}

async function getIncidents(checks: any[], env: Env) {
	const lists = await Promise.all(
		checks.map((c) => getJson(`${URLS.checks}/${c.token}/downtimes`, { headers: updownHeaders(env) })),
	);
	if (lists.some((l) => !Array.isArray(l))) return null;

	return checks
		.flatMap((c, i) =>
			lists[i].map((d: any) => ({
				check: c.alias || c.url,
				error: d.error ?? null,
				started_at: d.started_at,
				ended_at: d.ended_at ?? null,
				duration: d.duration ?? null,
			})),
		)
		.sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)))
		.slice(0, INCIDENT_LIMIT);
}

async function getUptimes(checks: any[], env: Env) {
	const from = encodeURIComponent(new Date(Date.now() - UPTIME_DAYS * 86400000).toISOString());
	return Promise.all(
		checks.map((c) =>
			getJson(`${URLS.checks}/${c.token}/metrics?from=${from}`, { headers: updownHeaders(env) }).then(
				(m) => m?.uptime ?? null,
			),
		),
	);
}

function publicCheck(c: any, uptime: number | null) {
	return {
		url: c.url,
		alias: c.alias ?? null,
		down: Boolean(c.down),
		down_since: c.down_since ?? null,
		error: c.error ?? null,
		uptime: uptime ?? c.uptime ?? null,
		last_check_at: c.last_check_at ?? null,
		domain: c.domain ? { remaining_days: c.domain.remaining_days ?? null } : null,
	};
}

function updownHeaders(env: Env) {
	return { 'X-API-KEY': env.UPDOWNIO_KEY, 'Accept-Encoding': 'gzip' };
}

const ALLOWED_ORIGINS = ['https://salm.dev', 'https://salm-dev-preview.nicosalm.workers.dev', 'http://localhost:8080'];

function corsHeaders(request: Request): Record<string, string> {
	const origin = request.headers.get('Origin');
	return {
		'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
		'Access-Control-Allow-Methods': 'GET',
		Vary: 'Origin',
	};
}

function withCors(response: Response, request: Request): Response {
	const r = new Response(response.body, response);
	for (const [k, v] of Object.entries(corsHeaders(request))) r.headers.set(k, v);
	return r;
}

const CACHE_TTL = 60;
const PARTIAL_CACHE_TTL = 15;
const INCIDENT_LIMIT = 3;
const UPTIME_DAYS = 30;
const AUDIENCE_LIMIT = 5;
const WEEK_MINUTES = 7 * 24 * 60;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders(request) });
		}

		const cache = caches.default;
		const cacheKey = new Request(new URL('/', request.url).toString(), { method: 'GET' });
		const cached = await cache.match(cacheKey);
		if (cached) return withCors(cached, request);

		try {
			const [[checksData, incidents, uptimes], stats] = await Promise.all([
				getJson(URLS.checks, { headers: updownHeaders(env) }).then(async (d) => {
					const checks = Array.isArray(d) ? d.filter((c: any) => c.enabled !== false) : null;
					if (!checks) return [null, null, null] as const;
					const [incidents, uptimes] = await Promise.all([getIncidents(checks, env), getUptimes(checks, env)]);
					return [checks, incidents, uptimes] as const;
				}),
				getStats(env).catch(() => null),
			]);

			const checks = (checksData ?? []).map((c, i) => publicCheck(c, uptimes?.[i] ?? null));

			const complete = Boolean(checksData && incidents && stats && !stats.partial);
			const ttl = complete ? CACHE_TTL : PARTIAL_CACHE_TTL;

			const response = new Response(JSON.stringify({ checks, incidents, stats }), {
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': `public, max-age=${ttl}`,
				},
			});

			ctx.waitUntil(cache.put(cacheKey, response.clone()));
			return withCors(response, request);
		} catch {
			return new Response(JSON.stringify({ error: 'Failed to fetch status data' }), {
				status: 502,
				headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
			});
		}
	},
};
