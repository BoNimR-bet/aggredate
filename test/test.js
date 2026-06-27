/* Offline unit tests — no network. Run: node test/test.js */
"use strict";
var A = require("../aggredate.js");
var backend = require("../api/badge.js");
var readmeBadge = require("../api/readme-badge.js");

var pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.log("  FAIL:", msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (got " + JSON.stringify(a) + ", expected " + JSON.stringify(b) + ")"); }

/* ---- formatting ---- */
eq(A.format(999), "999", "format 999");
eq(A.format(1000), "1k", "format 1000");
eq(A.format(1234), "1.2k", "format 1234");
eq(A.format(12000), "12k", "format 12000");
eq(A.format(12345), "12.3k", "format 12345");
eq(A.format(90100), "90.1k", "format 90100");
eq(A.format(1500000), "1.5M", "format 1.5M");
eq(A.format(null), "—", "format null");

/* ---- link parsing ---- */
eq(A.parseGitHub("https://github.com/tailwindlabs/tailwindcss"), "tailwindlabs/tailwindcss", "gh full url");
eq(A.parseGitHub("https://github.com/owner/repo.git"), "owner/repo", "gh .git stripped");
eq(A.parseGitHub("https://github.com/owner/repo/tree/main"), "owner/repo", "gh deep url");
eq(A.parseGitHub("owner/repo"), "owner/repo", "gh short form");
eq(A.parseGitHub("not a repo"), "", "gh invalid -> empty");
eq(A.parseGitLab("https://gitlab.com/group/subgroup/project/-/tree/main"), "group/subgroup/project", "gitlab full url");
eq(A.parseGitLab("group/project"), "group/project", "gitlab short form");
eq(A.parseNpm("https://www.npmjs.com/package/react"), "react", "npm url");
eq(A.parseNpm("https://www.npmjs.com/package/@scope/pkg"), "@scope/pkg", "npm scoped url");
eq(A.parseNpm("left-pad"), "left-pad", "npm bare name");
eq(A.parsePyPi("https://pypi.org/project/requests/"), "requests", "pypi url");
eq(A.parsePyPi("requests"), "requests", "pypi bare name");
eq(A.parseDocker("https://hub.docker.com/_/nginx"), "library/nginx", "docker official url");
eq(A.parseDocker("redis:latest"), "library/redis", "docker bare with tag");
eq(A.parseDocker("owner/image"), "owner/image", "docker owner image");
eq(A.parsePhId('<a href="x" ...><img src="...embed-image/v1/featured.svg?post_id=459123&theme=light"></a>'), "459123", "ph id from embed");
eq(A.parsePhId("123456"), "123456", "ph id bare number");
eq(A.parsePhId("https://www.producthunt.com/posts/some-slug"), "", "ph slug url -> no id (needs embed)");
ok(A.phBadgeUrl("42", "dark").indexOf("post_id=42") > -1 && A.phBadgeUrl("42", "dark").indexOf("theme=dark") > -1, "phBadgeUrl builds url");

/* ---- backend getCounts with a mocked fetch (no network) ---- */
function mockFetch(captured) {
  return function (url, opts) {
    captured.calls.push({ url: url, opts: opts });
    if (url.indexOf("api.github.com/repos/") > -1) {
      captured.ghAuth = opts && opts.headers && opts.headers.Authorization;
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ stargazers_count: 90123 }); } });
    }
    if (url.indexOf("api.npmjs.org/downloads/point/") > -1) {
      captured.npmUrl = url;
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ downloads: 845210 }); } });
    }
    if (url.indexOf("gitlab.com/api/v4/projects/") > -1) {
      captured.gitlabUrl = url;
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ star_count: 420 }); } });
    }
    if (url.indexOf("hub.docker.com/v2/repositories/") > -1) {
      captured.dockerUrl = url;
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ pull_count: 1200300 }); } });
    }
    if (url.indexOf("pypistats.org/api/packages/") > -1) {
      captured.pypiUrl = url;
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ data: { last_day: 10, last_week: 70, last_month: 300 } }); } });
    }
    if (url.indexOf("producthunt.com/v2/api/graphql") > -1) {
      captured.phBody = JSON.parse(opts.body).query;
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ data: { post: { votesCount: 540 } } }); } });
    }
    return Promise.resolve({ ok: false, status: 404 });
  };
}

(async function () {
  var cap = { calls: [] };
  var out = await backend.getCounts(
    { github: "a/b", gitlab: "g/p", npm: "p", npmPeriod: "month", pypi: "requests", pypiPeriod: "week", docker: "library/nginx", ph: "123456" },
    mockFetch(cap),
    { PH_TOKEN: "tok", GITHUB_TOKEN: "ghtok" }
  );
  eq(out.github, 90123, "backend github");
  eq(out.gitlab, 420, "backend gitlab");
  eq(out.npm, 845210, "backend npm");
  eq(out.pypi, 70, "backend pypi");
  eq(out.docker, 1200300, "backend docker");
  eq(out.producthunt, 540, "backend producthunt");
  eq(cap.ghAuth, "Bearer ghtok", "backend sends GitHub token");
  ok(cap.npmUrl.indexOf("last-month") > -1, "backend maps period -> last-month");
  ok(cap.gitlabUrl.indexOf("g%2Fp") > -1, "backend encodes GitLab path");
  ok(cap.dockerUrl.indexOf("library/nginx") > -1, "backend builds Docker Hub URL");
  ok(cap.phBody.indexOf("post(id:123456)") > -1, "backend PH queries by numeric id");

  // PH by slug should use slug query
  var cap2 = { calls: [] };
  await backend.getCounts({ ph: "my-slug" }, mockFetch(cap2), { PH_TOKEN: "tok" });
  ok(cap2.phBody.indexOf('post(slug:"my-slug")') > -1, "backend PH queries by slug when not numeric");

  // fail-soft: github 404 -> null, others still resolve
  function failingGh(url, opts) {
    if (url.indexOf("api.github.com") > -1) return Promise.resolve({ ok: false, status: 403 });
    return mockFetch({ calls: [] })(url, opts);
  }
  var out2 = await backend.getCounts({ github: "a/b", npm: "p" }, failingGh, {});
  eq(out2.github, null, "backend github fails soft to null");
  eq(out2.npm, 845210, "backend npm still resolves when github fails");

  // PH with no token -> null (fail soft), doesn't throw the whole call
  var out3 = await backend.getCounts({ ph: "123" }, mockFetch({ calls: [] }), {});
  eq(out3.producthunt, null, "backend PH without token fails soft");

  var svg = await readmeBadge.renderReadmeBadge(
    { github: "a/b", gitlab: "g/p", npm: "p", npmPeriod: "week", pypi: "requests", pypiPeriod: "month", docker: "library/nginx", ph: "123456", theme: "dark", label: "aggredate" },
    mockFetch({ calls: [] }),
    { PH_TOKEN: "tok" }
  );
  ok(svg.indexOf("<svg") === 0, "readme badge returns svg");
  ok(svg.indexOf("aggredate") > -1, "readme badge includes label");
  ok(svg.indexOf("90.1k") > -1, "readme badge includes github count");
  ok(svg.indexOf("420") > -1, "readme badge includes gitlab count");
  ok(svg.indexOf("845k") > -1, "readme badge includes npm count");
  ok(svg.indexOf("300") > -1, "readme badge includes pypi count");
  ok(svg.indexOf("1.2M") > -1, "readme badge includes docker count");
  ok(svg.indexOf("540") > -1, "readme badge includes PH count");

  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
