/**
 * Aggredate backend — a single Vercel serverless function.
 *
 * Returns unified, cached traction numbers as JSON:
 *   GET /api/badge?github=owner/repo&gitlab=group/project&npm=pkg&docker=library/nginx
 *   -> { "github": 90123, "gitlab": 420, "npm": 845210, "docker": 1230000 }
 *
 * Why a backend at all? It (1) gives a clean Product Hunt number so PH can be
 * styled to match the other pills, (2) hides your Product Hunt token, (3) raises
 * GitHub's rate limit with a token, and (4) caches so embeds stay fast.
 *
 * Environment variables (set in Vercel project settings):
 *   PH_TOKEN      - Product Hunt API developer token (required for PH numbers)
 *   GITHUB_TOKEN  - optional GitHub token (raises rate limit from 60 to 5000/hr)
 *
 * Deploy: drop this repo on Vercel; the file becomes /api/badge automatically.
 */

"use strict";

var CACHE = new Map();
var TTL_MS = 15 * 60 * 1000; // 15 minutes

function cacheGet(key) {
  var e = CACHE.get(key);
  if (e && e.exp > Date.now()) return e.val;
  if (e) CACHE.delete(key);
  return undefined;
}
function cacheSet(key, val) { CACHE.set(key, { val: val, exp: Date.now() + TTL_MS }); }

var NPM_PERIODS = { day: "last-day", week: "last-week", month: "last-month", year: "last-year" };
var PYPI_PERIODS = { day: "last_day", week: "last_week", month: "last_month" };

async function ghStars(repo, token, fetchImpl) {
  var headers = { Accept: "application/vnd.github+json", "User-Agent": "aggredate" };
  if (token) headers.Authorization = "Bearer " + token;
  var r = await fetchImpl("https://api.github.com/repos/" + repo, { headers: headers });
  if (!r.ok) throw new Error("github " + r.status);
  var d = await r.json();
  return d.stargazers_count;
}

async function npmDownloads(pkg, period, fetchImpl) {
  var p = NPM_PERIODS[period] || "last-week";
  var r = await fetchImpl("https://api.npmjs.org/downloads/point/" + p + "/" + pathEncode(pkg));
  if (!r.ok) throw new Error("npm " + r.status);
  var d = await r.json();
  return d.downloads;
}

async function gitlabStars(project, fetchImpl) {
  var r = await fetchImpl("https://gitlab.com/api/v4/projects/" + encodeURIComponent(project), {
    headers: { Accept: "application/json", "User-Agent": "aggredate" }
  });
  if (!r.ok) throw new Error("gitlab " + r.status);
  var d = await r.json();
  return d.star_count;
}

async function dockerPulls(image, fetchImpl) {
  var r = await fetchImpl("https://hub.docker.com/v2/repositories/" + pathEncode(image) + "/", {
    headers: { Accept: "application/json", "User-Agent": "aggredate" }
  });
  if (!r.ok) throw new Error("docker " + r.status);
  var d = await r.json();
  return d.pull_count;
}

async function pypiDownloads(pkg, period, fetchImpl) {
  var r = await fetchImpl("https://pypistats.org/api/packages/" + encodeURIComponent(pkg) + "/recent", {
    headers: { Accept: "application/json", "User-Agent": "aggredate" }
  });
  if (!r.ok) throw new Error("pypi " + r.status);
  var d = await r.json();
  var key = PYPI_PERIODS[period] || "last_month";
  return d && d.data ? d.data[key] : null;
}

async function phVotes(idOrSlug, token, fetchImpl) {
  if (!token) throw new Error("missing PH_TOKEN");
  var isId = /^\d+$/.test(String(idOrSlug));
  var query = isId ? "query{post(id:" + idOrSlug + "){votesCount}}"
                    : 'query{post(slug:"' + String(idOrSlug).replace(/"/g, "") + '"){votesCount}}';
  var r = await fetchImpl("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ query: query })
  });
  if (!r.ok) throw new Error("producthunt " + r.status);
  var d = await r.json();
  return d && d.data && d.data.post ? d.data.post.votesCount : null;
}

function pathEncode(v) {
  return String(v).split("/").map(encodeURIComponent).join("/");
}

/**
 * Pure aggregator — easy to unit test by injecting a fake fetch and env.
 * Each source fails soft (returns null) so one outage can't break the strip.
 */
async function getCounts(params, fetchImpl, env) {
  fetchImpl = fetchImpl || (typeof fetch !== "undefined" ? fetch : null);
  env = env || (typeof process !== "undefined" ? process.env : {});
  if (!fetchImpl) throw new Error("no fetch available");

  var out = {};
  var jobs = [];
  if (params.github) jobs.push(ghStars(params.github, env.GITHUB_TOKEN, fetchImpl).then(function (v) { out.github = v; }, function () { out.github = null; }));
  if (params.gitlab) jobs.push(gitlabStars(params.gitlab, fetchImpl).then(function (v) { out.gitlab = v; }, function () { out.gitlab = null; }));
  if (params.npm) jobs.push(npmDownloads(params.npm, params.npmPeriod, fetchImpl).then(function (v) { out.npm = v; }, function () { out.npm = null; }));
  if (params.pypi) jobs.push(pypiDownloads(params.pypi, params.pypiPeriod, fetchImpl).then(function (v) { out.pypi = v; }, function () { out.pypi = null; }));
  if (params.docker) jobs.push(dockerPulls(params.docker, fetchImpl).then(function (v) { out.docker = v; }, function () { out.docker = null; }));
  if (params.ph) jobs.push(phVotes(params.ph, env.PH_TOKEN, fetchImpl).then(function (v) { out.producthunt = v; }, function () { out.producthunt = null; }));
  await Promise.all(jobs);
  return out;
}

async function handler(req, res) {
  var q = (req && req.query) || {};
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  var params = {
    github: q.github,
    gitlab: q.gitlab,
    npm: q.npm,
    npmPeriod: q.npmPeriod,
    pypi: q.pypi,
    pypiPeriod: q.pypiPeriod,
    docker: q.docker,
    ph: q.ph
  };
  var key = JSON.stringify(params);

  try {
    var data = cacheGet(key);
    if (!data) { data = await getCounts(params); cacheSet(key, data); }
    res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: String(err && err.message || err) });
  }
}

module.exports = handler;
module.exports.handler = handler;
module.exports.getCounts = getCounts;
module.exports.ghStars = ghStars;
module.exports.npmDownloads = npmDownloads;
module.exports.gitlabStars = gitlabStars;
module.exports.dockerPulls = dockerPulls;
module.exports.pypiDownloads = pypiDownloads;
module.exports.phVotes = phVotes;
