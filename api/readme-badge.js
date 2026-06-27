"use strict";

var badge = require("./badge.js");

var PERIOD_LABELS = { day: "downloads/day", week: "downloads/wk", month: "downloads/mo", year: "downloads/yr" };
var PYPI_PERIOD_LABELS = { day: "downloads/day", week: "downloads/wk", month: "downloads/mo" };
var THEMES = {
  light: { bg: "#ffffff", label: "#24292f", text: "#24292f", sub: "#57606a", border: "#d0d7de" },
  dark: { bg: "#0d1117", label: "#f0f6fc", text: "#f0f6fc", sub: "#8b949e", border: "#30363d" }
};

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

function cleanHex(v, fallback) {
  v = String(v || "").trim();
  return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
}

function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return "-";
  n = Number(n);
  var a = Math.abs(n);
  if (a < 1000) return String(n);
  if (a < 1000000) return trim(n / 1000) + "k";
  return trim(n / 1000000) + "M";
}

function trim(n) {
  return String(Math.abs(n) >= 100 ? Math.round(n) : n.toFixed(1)).replace(/\.0$/, "");
}

function width(text) {
  return Math.max(54, Math.round(String(text).length * 7.1 + 24));
}

async function renderReadmeBadge(params, fetchImpl, env) {
  params = params || {};
  var theme = THEMES[params.theme === "dark" ? "dark" : "light"];
  var accent = cleanHex(params.accent, "#16a34a");
  var label = String(params.label || "traction").slice(0, 32);
  var counts = await badge.getCounts({
    github: params.github,
    gitlab: params.gitlab,
    npm: params.npm,
    npmPeriod: params.npmPeriod || "week",
    pypi: params.pypi,
    pypiPeriod: params.pypiPeriod || "month",
    docker: params.docker,
    ph: params.ph
  }, fetchImpl, env);

  var parts = [];
  if (params.github) parts.push({ name: "stars", value: fmt(counts.github) });
  if (params.gitlab) parts.push({ name: "gitlab stars", value: fmt(counts.gitlab) });
  if (params.npm) parts.push({ name: PERIOD_LABELS[params.npmPeriod] || PERIOD_LABELS.week, value: fmt(counts.npm) });
  if (params.pypi) parts.push({ name: PYPI_PERIOD_LABELS[params.pypiPeriod] || PYPI_PERIOD_LABELS.month, value: fmt(counts.pypi) });
  if (params.docker) parts.push({ name: "docker pulls", value: fmt(counts.docker) });
  if (params.ph) parts.push({ name: "upvotes", value: fmt(counts.producthunt) });
  if (!parts.length) parts.push({ name: "live badge", value: "ready" });

  var labelW = width(label);
  var x = labelW;
  var body = [
    '<rect width="100%" height="32" rx="8" fill="' + theme.bg + '" stroke="' + theme.border + '"/>',
    '<rect width="' + labelW + '" height="32" rx="8" fill="' + accent + '"/>',
    '<text x="' + Math.round(labelW / 2) + '" y="21" text-anchor="middle" fill="#fff" font-weight="700">' + esc(label) + "</text>"
  ];

  parts.forEach(function (p, i) {
    var txt = p.value + " " + p.name;
    var w = width(txt);
    var mid = x + Math.round(w / 2);
    if (i > 0) body.push('<line x1="' + x + '" y1="7" x2="' + x + '" y2="25" stroke="' + theme.border + '"/>');
    body.push('<text x="' + mid + '" y="21" text-anchor="middle"><tspan fill="' + theme.text + '" font-weight="700">' + esc(p.value) + '</tspan><tspan fill="' + theme.sub + '"> ' + esc(p.name) + "</tspan></text>");
    x += w;
  });

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + x + '" height="32" viewBox="0 0 ' + x + ' 32" role="img" aria-label="' + esc(label) + '">' +
    '<style>text{font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}</style>' +
    body.join("") +
    "</svg>";
}

async function handler(req, res) {
  var q = (req && req.query) || {};
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
  try {
    res.status(200).send(await renderReadmeBadge(q));
  } catch (err) {
    res.status(500).send('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="32"><text x="8" y="21" font-size="13">badge error</text></svg>');
  }
}

module.exports = handler;
module.exports.handler = handler;
module.exports.renderReadmeBadge = renderReadmeBadge;
