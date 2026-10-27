import Fetch from "@11ty/eleventy-fetch";

const USER = "nicosalm";
const PROJECT_TOPIC = "project";
const MIN_STARS = 100;
const PULLS_SHOWN = 3;

const SUMMARY_LENGTH = 300;

const API = "https://api.github.com";
const SITE_HOSTS = ["salm.dev", "www.salm.dev"];
const ISSUE_REF = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/i;
const ISSUE_REFS = new RegExp(ISSUE_REF.source, "gi");

function link(repo) {
  const homepage = (repo.homepage || "").trim();
  if (!homepage) return repo.html_url;
  try {
    const url = new URL(/^https?:\/\//i.test(homepage) ? homepage : `https://${homepage}`);
    return SITE_HOSTS.includes(url.hostname) ? url.pathname + url.search + url.hash : url.href;
  } catch {
    return repo.html_url;
  }
}

function linked(repo) {
  const url = link(repo);
  return { url, external: !url.startsWith("/") };
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function summary(body) {
  const paragraph = (body || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(details|script|style)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/\r/g, "")
    .replace(/^#{1,6}\s.*$/gm, "")
    .replace(/^\s*(\*\*|__)[^*_\n]+\1:?\s*$/gm, "")
    .replace(/<[^>\n]+>/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\n\s*/g, " "))
    .find((p) => p && !/^(>|[-*+] |\d+\. |\||```|!\[)/.test(p) && !/^release notes/i.test(p) && p.replace(ISSUE_REFS, "").replace(/[\s.,]/g, ""));
  if (!paragraph) return "";

  const plain = paragraph.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*|__/g, "").replace(/\s{2,}/g, " ");
  let text = (plain.match(/^[\s\S]+?[.!?](?=\s+[A-Z`]|$)/) || [plain])[0];
  if (text.length > SUMMARY_LENGTH) text = text.slice(0, SUMMARY_LENGTH).replace(/\s+\S*$/, "") + "…";
  return escapeHtml(text).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function get(path) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "salm.dev" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return Fetch(`${API}${path}`, { duration: "1h", type: "json", fetchOptions: { headers } });
}

async function all(path, pick = (page) => page) {
  const items = [];
  for (let page = 1; ; page++) {
    const batch = pick(await get(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`));
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

function repos() {
  return all(`/users/${USER}/repos?type=owner&sort=pushed`);
}

function projects(repos) {
  return repos
    .filter((r) => !r.fork && (r.topics || []).includes(PROJECT_TOPIC))
    .map((r) => ({
      name: r.name,
      ...linked(r),
      description: r.description || "",
      language: r.language,
      archived: r.archived,
    }));
}

async function diffStats(repo, pr) {
  try {
    const detail = await get(`/repos/${repo}/pulls/${pr.number}`);
    return { additions: detail.additions, deletions: detail.deletions };
  } catch {
    return { additions: null, deletions: null };
  }
}

async function contributions() {
  const query = encodeURIComponent(`is:pr author:${USER} is:merged -user:${USER}`);
  const prs = await all(`/search/issues?q=${query}`, (page) => page.items);

  const byRepo = new Map();
  for (const pr of prs) {
    const name = pr.repository_url.split("/repos/")[1];
    if (!byRepo.has(name)) byRepo.set(name, []);
    const fixes = (pr.body || "").match(ISSUE_REF);
    byRepo.get(name).push({
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      merged: pr.pull_request.merged_at,
      summary: summary(pr.body),
      fixes: fixes ? { number: fixes[1], url: `https://github.com/${name}/issues/${fixes[1]}` } : null,
    });
  }

  const repos = await Promise.all(
    [...byRepo.keys()].map(async (name) => {
      const repo = await get(`/repos/${name}`);
      return {
        name,
        ...linked(repo),
        language: repo.language,
        stars: repo.stargazers_count,
        pulls: byRepo.get(name),
      };
    })
  );

  const kept = repos.filter((r) => r.stars >= MIN_STARS);
  await Promise.all(
    kept.map(async (repo) => {
      const newest = repo.pulls.sort((a, b) => b.merged.localeCompare(a.merged));
      repo.pullCount = newest.length;
      repo.pullsUrl = `https://github.com/${repo.name}/pulls?q=${encodeURIComponent(`is:pr is:merged author:${USER}`)}`;
      repo.pulls = await Promise.all(
        newest.slice(0, PULLS_SHOWN).map(async (pr) => ({ ...pr, ...(await diffStats(repo.name, pr)) }))
      );
    })
  );
  return kept.sort((a, b) => b.pulls[0].merged.localeCompare(a.pulls[0].merged));
}

export default async function () {
  try {
    return { user: USER, projects: projects(await repos()), contributions: await contributions() };
  } catch (err) {
    if (process.env.CI) throw err;
    console.warn(`[github] ${err.message}; rendering without GitHub data`);
    return { user: USER, projects: [], contributions: [] };
  }
}
