/*!
 * Aggredate v2.2.0 - a tiny, dependency-free badge strip that aggregates your
 * product's traction: GitHub/GitLab stars, Product Hunt upvotes, package
 * downloads, Docker pulls, and custom launch metrics.
 *
 * Fully automatic: paste your links and every number updates itself.
 *   - GitHub, GitLab, npm, Docker, and PyPI numbers are fetched from public APIs.
 *   - Product Hunt uses the official auto-updating badge (no token needed) when
 *     you supply your post id / embed; or a unified number via the optional API.
 *
 *   <div data-aggredate
 *        data-github="https://github.com/owner/repo"
 *        data-npm="my-pkg"
 *        data-ph-embed="...your Product Hunt embed code..."></div>
 *   <script src="aggredate.js" async></script>
 *
 * MIT License.
 */
(function (global) {
  "use strict";

  var VERSION = "2.2.0";
  var CSS_ID = "aggredate-css";
  var BRAND_URL = "https://aggredate.dev"; // change to your deployed site

  var ICONS = {
    github: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
    producthunt: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm1.6 13.2h-2.9V17H8.4V7h5.2c2.07 0 3.75 1.66 3.75 3.1 0 1.44-1.68 3.1-3.75 3.1zm0-4.85h-2.9v3.5h2.9c.99 0 1.78-.78 1.78-1.75s-.79-1.75-1.78-1.75z"/></svg>',
    npm: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H4v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/></svg>',
    gitlab: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M22.7 13.2 20 4.9c-.1-.4-.7-.4-.9 0l-1.8 5.5H6.7L4.9 4.9c-.1-.4-.7-.4-.9 0l-2.7 8.3c-.1.4 0 .8.4 1l10 7.3c.2.1.4.1.6 0l10-7.3c.3-.2.5-.6.4-1z"/></svg>',
    docker: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M23 11.1c-.9-.6-2-.7-3.1-.4-.1-1-.7-1.9-1.6-2.5l-.7-.4-.4.7c-.5.8-.6 1.9-.2 2.8H1.4l-.1.7c-.2 1.8.3 3.4 1.5 4.6 1.1 1.2 2.8 1.8 4.9 1.8h5.2c3.4 0 6-1.5 7.4-4.2 1.2.1 2.3-.4 3-1.4l.5-.7-.8-.6zM5.5 9.8H3.2V7.5h2.3v2.3zm2.8 0H6V7.5h2.3v2.3zm2.8 0H8.8V7.5h2.3v2.3zm0-2.8H8.8V4.7h2.3V7zm2.8 2.8h-2.3V7.5h2.3v2.3zm0-2.8h-2.3V4.7h2.3V7zm2.8 2.8h-2.3V7.5h2.3v2.3z"/></svg>',
    pypi: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M12 2 4 6.5v9L12 20l8-4.5v-9L12 2zm0 2.2 5.7 3.2L12 10.6 6.3 7.4 12 4.2zm-6 5 5 2.8v5.8l-5-2.8V9.2zm7 8.6V12l5-2.8V15l-5 2.8z"/></svg>',
    custom: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="m12 2 2.8 6 6.5.8-4.8 4.5 1.3 6.5L12 16.5l-5.8 3.3 1.3-6.5-4.8-4.5L9.2 8 12 2z"/></svg>',
    brand: '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="currentColor"><path d="M13 2 4.5 12.5c-.4.5-.6.7-.6 1 0 .2.1.4.3.5.3.2.6.2 1.2.2H10l-1 7.5c-.1.6.6.9 1 .4L18.5 11.5c.4-.5.6-.7.6-1 0-.2-.1-.4-.3-.5-.3-.2-.6-.2-1.2-.2H14l1-7.5c.1-.6-.6-.9-1-.4z"/></svg>'
  };

  var LABELS = { github: "stars", gitlab: "stars", producthunt: "upvotes", docker: "pulls", custom: "custom" };
  var NPM_PERIODS = { day: "last-day", week: "last-week", month: "last-month", year: "last-year" };
  var PYPI_PERIODS = { day: "last_day", week: "last_week", month: "last_month" };

  var CSS = [
    '.aggredate{--ag-bg:#fff;--ag-fg:#1f2328;--ag-bd:#d0d7de;--ag-mut:#59636e;--ag-ac:#6366f1;',
    'display:inline-flex;flex-wrap:wrap;gap:8px;align-items:center;line-height:1;vertical-align:middle;',
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}",
    '.aggredate[data-theme="dark"]{--ag-bg:#161b22;--ag-fg:#e6edf3;--ag-bd:#30363d;--ag-mut:#9198a1}',
    '.ag-badge{display:inline-flex;align-items:center;gap:6px;text-decoration:none;box-sizing:border-box;',
    'padding:6px 11px;border:1px solid var(--ag-bd);border-radius:999px;background:var(--ag-bg);',
    'color:var(--ag-fg);font-size:13px;font-weight:500;white-space:nowrap;',
    'transition:border-color .15s ease,transform .15s ease,box-shadow .15s ease}',
    'a.ag-badge:hover{border-color:var(--ag-ac);transform:translateY(-1px);box-shadow:0 2px 10px rgba(0,0,0,.08)}',
    '.ag-badge svg{flex:0 0 auto;display:block}',
    '.ag-producthunt svg{color:#da552f}',
    '.ag-npm svg{color:#cb3837}',
    '.ag-gitlab svg{color:#e24329}',
    '.ag-docker svg{color:#2496ed}',
    '.ag-pypi svg{color:#3775a9}',
    '.ag-custom svg{color:var(--ag-ac)}',
    '.ag-val{font-weight:700;font-variant-numeric:tabular-nums}',
    '.ag-lbl{color:var(--ag-mut)}',
    '.ag-skel{display:inline-block;width:30px;height:9px;border-radius:4px;vertical-align:middle;',
    'background:linear-gradient(90deg,var(--ag-bd) 25%,rgba(140,140,140,.18) 37%,var(--ag-bd) 63%);',
    'background-size:400% 100%;animation:ag-shimmer 1.2s ease infinite}',
    '@keyframes ag-shimmer{0%{background-position:100% 50%}100%{background-position:0 50%}}',
    '@media (prefers-reduced-motion: reduce){.ag-skel{animation:none}.ag-badge{transition:none}}',
    '.ag-ph-badge{display:inline-flex;align-items:center}',
    '.ag-ph-badge img{height:34px;width:auto;display:block;border-radius:8px}',
    '.ag-brand{font-size:12px;color:var(--ag-mut);font-weight:600}',
    '.ag-brand svg{color:var(--ag-ac)}',
    '.aggredate[data-size="sm"] .ag-badge{padding:4px 9px;font-size:12px;gap:5px}',
    '.aggredate[data-size="sm"] .ag-badge svg{width:14px;height:14px}',
    '.aggredate[data-size="sm"] .ag-ph-badge img{height:28px}'
  ].join("");

  function injectCSS() {
    if (typeof document === "undefined" || document.getElementById(CSS_ID)) return;
    var s = document.createElement("style");
    s.id = CSS_ID; s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function fmt(n) {
    if (n === null || n === undefined || isNaN(n)) return "—";
    n = Number(n);
    var s, a = Math.abs(n);
    if (a < 1000) return String(n);
    if (a < 1e6) { s = n / 1e3; return (Math.abs(s) >= 100 ? Math.round(s) : strip(s.toFixed(1))) + "k"; }
    s = n / 1e6; return (Math.abs(s) >= 100 ? Math.round(s) : strip(s.toFixed(1))) + "M";
  }
  function strip(x) { return String(x).replace(/\.0$/, ""); }
  function periodLabel(p) {
    return p === "month" ? "downloads/mo" : p === "year" ? "downloads/yr" : p === "day" ? "downloads/day" : "downloads/wk";
  }
  function pypiPeriodLabel(p) {
    return p === "week" ? "downloads/wk" : p === "day" ? "downloads/day" : "downloads/mo";
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  function parseGitHub(v) {
    if (!v) return "";
    v = String(v).trim();
    var m = v.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
    if (m) return m[1] + "/" + m[2].replace(/\.git$/, "");
    if (/^[\w.-]+\/[\w.-]+$/.test(v)) return v.replace(/\.git$/, "");
    return "";
  }
  function parseNpm(v) {
    if (!v) return "";
    v = String(v).trim();
    var m = v.match(/npmjs\.com\/package\/([^\s#?]+)/i);
    if (m) return decodeURIComponent(m[1]);
    return v.replace(/^https?:\/\/\S+/i, "");
  }
  function parseGitLab(v) {
    if (!v) return "";
    v = String(v).trim();
    var m = v.match(/gitlab\.com\/([^#?\s]+)/i);
    if (m) v = m[1];
    v = v.replace(/\.git$/, "").replace(/\/-\/.*$/, "").replace(/^\/+|\/+$/g, "");
    return /^[\w.%-]+(\/[\w.%-]+)+$/.test(v) ? v : "";
  }
  function parseDocker(v) {
    if (!v) return "";
    v = String(v).trim();
    var m = v.match(/hub\.docker\.com\/_\/([^/\s#?]+)/i);
    if (m) return "library/" + cleanImagePart(m[1]);
    m = v.match(/hub\.docker\.com\/r\/([^/\s#?]+)(?:\/([^/\s#?]+))?/i);
    if (m) return cleanDocker(m[2] ? m[1] + "/" + m[2] : "library/" + m[1]);
    v = v.replace(/^docker\.io\//i, "").replace(/^https?:\/\/[^/]+\//i, "");
    return cleanDocker(v);
  }
  function parsePyPi(v) {
    if (!v) return "";
    v = String(v).trim();
    var m = v.match(/pypi\.org\/project\/([^/\s#?]+)/i);
    if (m) return decodeURIComponent(m[1]);
    return /^[A-Za-z0-9_.-]+$/.test(v) ? v : "";
  }
  function cleanDocker(v) {
    v = String(v || "").split("@")[0].replace(/:[^/:]+$/, "").replace(/^\/+|\/+$/g, "");
    if (!v) return "";
    if (v.indexOf("/") < 0) v = "library/" + v;
    return /^[\w.-]+\/[\w.-]+$/.test(v) ? v : "";
  }
  function cleanImagePart(v) {
    return String(v || "").replace(/:[^/:]+$/, "");
  }
  function parsePhId(v) {
    if (!v) return "";
    v = String(v).trim();
    var m = v.match(/post_id=(\d+)/i);
    if (m) return m[1];
    m = v.match(/\/posts\/(\d+)/i);
    if (m) return m[1];
    if (/^\d+$/.test(v)) return v;
    return "";
  }
  function phBadgeUrl(id, theme) {
    return "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=" + id + "&theme=" + (theme === "dark" ? "dark" : "light");
  }

  function fetchGitHub(repo) {
    return fetch("https://api.github.com/repos/" + repo, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { if (!r.ok) throw new Error("github " + r.status); return r.json(); })
      .then(function (d) { return d.stargazers_count; });
  }
  function fetchNpm(pkg, period) {
    var p = NPM_PERIODS[period] || "last-week";
    return fetch("https://api.npmjs.org/downloads/point/" + p + "/" + pathEncode(pkg))
      .then(function (r) { if (!r.ok) throw new Error("npm " + r.status); return r.json(); })
      .then(function (d) { return d.downloads; });
  }
  function fetchGitLab(project) {
    return fetch("https://gitlab.com/api/v4/projects/" + encodeURIComponent(project), { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("gitlab " + r.status); return r.json(); })
      .then(function (d) { return d.star_count; });
  }
  function fetchDocker(image) {
    return fetch("https://hub.docker.com/v2/repositories/" + pathEncode(image) + "/", { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("docker " + r.status); return r.json(); })
      .then(function (d) { return d.pull_count; });
  }
  function fetchPyPi(pkg, period) {
    return fetch("https://pypistats.org/api/packages/" + encodeURIComponent(pkg) + "/recent", { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("pypi " + r.status); return r.json(); })
      .then(function (d) { var key = PYPI_PERIODS[period] || "last_month"; return d && d.data ? d.data[key] : null; });
  }
  function pathEncode(v) {
    return String(v).split("/").map(encodeURIComponent).join("/");
  }
  function fetchApi(cfg) {
    var u = cfg.api + (cfg.api.indexOf("?") < 0 ? "?" : "&");
    var q = [];
    if (cfg.github) q.push("github=" + encodeURIComponent(cfg.github));
    if (cfg.gitlab) q.push("gitlab=" + encodeURIComponent(cfg.gitlab));
    if (cfg.npm) { q.push("npm=" + encodeURIComponent(cfg.npm)); q.push("npmPeriod=" + encodeURIComponent(cfg.npmPeriod)); }
    if (cfg.pypi) { q.push("pypi=" + encodeURIComponent(cfg.pypi)); q.push("pypiPeriod=" + encodeURIComponent(cfg.pypiPeriod)); }
    if (cfg.docker) q.push("docker=" + encodeURIComponent(cfg.docker));
    if (cfg.phId) q.push("ph=" + encodeURIComponent(cfg.phId));
    return fetch(u + q.join("&")).then(function (r) { if (!r.ok) throw new Error("api " + r.status); return r.json(); });
  }

  function pill(kind, url, labelText, showLabel) {
    var node = document.createElement(url ? "a" : "span");
    node.className = "ag-badge ag-" + kind;
    if (url) { node.href = url; node.target = "_blank"; node.rel = "noopener noreferrer"; }
    var lbl = showLabel ? '<span class="ag-lbl">' + esc(labelText) + "</span>" : "";
    node.innerHTML = ICONS[kind] + '<span class="ag-val"><span class="ag-skel"></span></span>' + lbl;
    node._label = labelText;
    return node;
  }
  function setVal(node, value) {
    var v = node.querySelector(".ag-val");
    if (v) v.textContent = fmt(value);
    if (value !== null && value !== undefined && !isNaN(value)) node.setAttribute("aria-label", fmt(value) + " " + (node._label || ""));
  }
  function setTextVal(node, value) {
    var v = node.querySelector(".ag-val");
    if (v) v.textContent = value === null || value === undefined || value === "" ? "ready" : String(value);
  }
  function phOfficial(id, theme, url) {
    var wrap = document.createElement(url ? "a" : "span");
    wrap.className = "ag-ph-badge";
    if (url) { wrap.href = url; wrap.target = "_blank"; wrap.rel = "noopener noreferrer"; }
    var img = document.createElement("img");
    img.src = phBadgeUrl(id, theme);
    img.alt = "Featured on Product Hunt";
    img.loading = "lazy";
    img.onerror = function () { wrap.style.display = "none"; };
    wrap.appendChild(img);
    return wrap;
  }
  function brandEl(url) {
    var a = document.createElement("a");
    a.className = "ag-badge ag-brand";
    a.href = url; a.target = "_blank"; a.rel = "noopener";
    a.title = "Powered by Aggredate";
    a.innerHTML = ICONS.brand + "<span>Aggredate</span>";
    return a;
  }

  function normalize(cfg) {
    cfg = cfg || {};
    var gh = parseGitHub(cfg.github);
    var np = parseNpm(cfg.npm);
    var gl = parseGitLab(cfg.gitlab);
    var dk = parseDocker(cfg.docker);
    var py = parsePyPi(cfg.pypi);
    var phId = parsePhId(cfg.phId || cfg.phEmbed || cfg.phUrl);
    return {
      github: gh,
      githubUrl: cfg.githubUrl || (gh ? "https://github.com/" + gh : ""),
      gitlab: gl,
      gitlabUrl: cfg.gitlabUrl || (gl ? "https://gitlab.com/" + gl : ""),
      npm: np,
      npmPeriod: cfg.npmPeriod || "week",
      npmUrl: cfg.npmUrl || (np ? "https://www.npmjs.com/package/" + np : ""),
      pypi: py,
      pypiPeriod: cfg.pypiPeriod || "month",
      pypiUrl: cfg.pypiUrl || (py ? "https://pypi.org/project/" + py + "/" : ""),
      docker: dk,
      dockerUrl: cfg.dockerUrl || (dk ? "https://hub.docker.com/r/" + dk : ""),
      phId: phId,
      phUrl: cfg.phUrl && /producthunt\.com/i.test(cfg.phUrl) ? cfg.phUrl : "",
      customLabel: cfg.customLabel || "",
      customValue: cfg.customValue || "",
      customUrl: cfg.customUrl || "",
      api: cfg.api || "",
      theme: cfg.theme || "auto",
      accent: cfg.accent || "",
      size: cfg.size || "md",
      labels: cfg.labels !== false && cfg.labels !== "false",
      branding: cfg.branding !== false && cfg.branding !== "false",
      brandUrl: cfg.brandUrl || BRAND_URL
    };
  }
  function readConfig(el) {
    var d = el.dataset || {};
    return {
      github: d.github, githubUrl: d.githubUrl,
      gitlab: d.gitlab, gitlabUrl: d.gitlabUrl,
      npm: d.npm, npmPeriod: d.npmPeriod, npmUrl: d.npmUrl,
      pypi: d.pypi, pypiPeriod: d.pypiPeriod, pypiUrl: d.pypiUrl,
      docker: d.docker, dockerUrl: d.dockerUrl,
      phId: d.phId, phEmbed: d.phEmbed, phUrl: d.phUrl,
      customLabel: d.customLabel, customValue: d.customValue, customUrl: d.customUrl,
      api: d.api, theme: d.theme, accent: d.accent, size: d.size, labels: d.labels,
      branding: d.branding, brandUrl: d.brandUrl
    };
  }
  function resolveTheme(cfg) {
    if (cfg.theme === "auto") return (global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    return cfg.theme === "dark" ? "dark" : "light";
  }

  function render(el, cfg) {
    if (!el) return el;
    injectCSS();
    cfg = normalize(arguments.length > 1 && cfg ? cfg : readConfig(el));
    var theme = resolveTheme(cfg);
    el.classList.add("aggredate");
    el.setAttribute("data-aggredate-ready", "1");
    el.setAttribute("data-theme", theme);
    el.setAttribute("data-size", cfg.size === "sm" ? "sm" : "md");
    if (cfg.accent) el.style.setProperty("--ag-ac", cfg.accent); else el.style.removeProperty("--ag-ac");
    el.innerHTML = "";

    if (cfg.api) {
      var gp = cfg.github ? pill("github", cfg.githubUrl, LABELS.github, cfg.labels) : null;
      var glp = cfg.gitlab ? pill("gitlab", cfg.gitlabUrl, LABELS.gitlab, cfg.labels) : null;
      var pp = cfg.phId ? pill("producthunt", cfg.phUrl, LABELS.producthunt, cfg.labels) : null;
      var np2 = cfg.npm ? pill("npm", cfg.npmUrl, periodLabel(cfg.npmPeriod), cfg.labels) : null;
      var pyp = cfg.pypi ? pill("pypi", cfg.pypiUrl, pypiPeriodLabel(cfg.pypiPeriod), cfg.labels) : null;
      var dp = cfg.docker ? pill("docker", cfg.dockerUrl, LABELS.docker, cfg.labels) : null;
      if (gp) el.appendChild(gp);
      if (glp) el.appendChild(glp);
      if (pp) el.appendChild(pp);
      if (np2) el.appendChild(np2);
      if (pyp) el.appendChild(pyp);
      if (dp) el.appendChild(dp);
      fetchApi(cfg).then(function (d) {
        if (gp) setVal(gp, d.github);
        if (glp) setVal(glp, d.gitlab);
        if (pp) setVal(pp, d.producthunt);
        if (np2) setVal(np2, d.npm);
        if (pyp) setVal(pyp, d.pypi);
        if (dp) setVal(dp, d.docker);
      }).catch(function () {
        if (gp) setVal(gp, null); if (glp) setVal(glp, null); if (pp) setVal(pp, null); if (np2) setVal(np2, null); if (pyp) setVal(pyp, null); if (dp) setVal(dp, null);
      });
    } else {
      if (cfg.github) {
        var g = pill("github", cfg.githubUrl, LABELS.github, cfg.labels);
        el.appendChild(g);
        fetchGitHub(cfg.github).then(function (v) { setVal(g, v); }).catch(function () { setVal(g, null); });
      }
      if (cfg.gitlab) {
        var glb = pill("gitlab", cfg.gitlabUrl, LABELS.gitlab, cfg.labels);
        el.appendChild(glb);
        fetchGitLab(cfg.gitlab).then(function (v) { setVal(glb, v); }).catch(function () { setVal(glb, null); });
      }
      if (cfg.phId) el.appendChild(phOfficial(cfg.phId, theme, cfg.phUrl));
      if (cfg.npm) {
        var n = pill("npm", cfg.npmUrl, periodLabel(cfg.npmPeriod), cfg.labels);
        el.appendChild(n);
        fetchNpm(cfg.npm, cfg.npmPeriod).then(function (v) { setVal(n, v); }).catch(function () { setVal(n, null); });
      }
      if (cfg.pypi) {
        var pyb = pill("pypi", cfg.pypiUrl, pypiPeriodLabel(cfg.pypiPeriod), cfg.labels);
        el.appendChild(pyb);
        fetchPyPi(cfg.pypi, cfg.pypiPeriod).then(function (v) { setVal(pyb, v); }).catch(function () { setVal(pyb, null); });
      }
      if (cfg.docker) {
        var db = pill("docker", cfg.dockerUrl, LABELS.docker, cfg.labels);
        el.appendChild(db);
        fetchDocker(cfg.docker).then(function (v) { setVal(db, v); }).catch(function () { setVal(db, null); });
      }
    }

    if (cfg.customLabel || cfg.customValue) {
      var cb = pill("custom", cfg.customUrl, cfg.customLabel || LABELS.custom, cfg.labels);
      el.appendChild(cb);
      setTextVal(cb, cfg.customValue);
    }
    if (cfg.branding) el.appendChild(brandEl(cfg.brandUrl));
    return el;
  }

  function initAll(root) {
    if (typeof document === "undefined") return;
    var nodes = (root || document).querySelectorAll("[data-aggredate]:not([data-aggredate-ready])");
    for (var i = 0; i < nodes.length; i++) render(nodes[i]);
  }
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn();
  }

  var api = {
    render: render, init: initAll, format: fmt, version: VERSION,
    parseGitHub: parseGitHub, parseGitLab: parseGitLab, parseNpm: parseNpm, parsePyPi: parsePyPi,
    parseDocker: parseDocker, parsePhId: parsePhId, phBadgeUrl: phBadgeUrl
  };
  global.Aggredate = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") ready(initAll);

})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
