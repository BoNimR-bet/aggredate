(function () {
  "use strict";

  var STORAGE_KEY = "aggredate.studio.projects.v1";
  var DRAFT_KEY = "aggredate.studio.draft.v1";
  var DEFAULT_PROJECT = {
    id: "default",
    name: "Tailwind launch badge",
    github: "https://github.com/tailwindlabs/tailwindcss",
    gitlab: "",
    npm: "tailwindcss",
    npmPeriod: "week",
    productHunt: "",
    pypi: "",
    pypiPeriod: "month",
    docker: "",
    customLabel: "",
    customValue: "",
    customUrl: "",
    theme: "auto",
    accent: "#0f766e",
    size: "md",
    labels: true,
    branding: true,
    hostBase: "https://your-site.com",
    api: "",
    badgeLabel: "traction",
    linkTarget: "https://your-site.com"
  };

  var state = clone(DEFAULT_PROJECT);
  var codeTab = "website";
  var previewBg = "light";
  var renderTimer = null;
  var toastTimer = null;
  var nodes = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    nodes = {
      form: byId("editor-form"),
      projectSelect: byId("project-select"),
      projectName: byId("project-name"),
      github: byId("github"),
      gitlab: byId("gitlab"),
      npm: byId("npm"),
      npmPeriod: byId("npm-period"),
      productHunt: byId("product-hunt"),
      pypi: byId("pypi"),
      pypiPeriod: byId("pypi-period"),
      docker: byId("docker"),
      customLabel: byId("custom-label"),
      customValue: byId("custom-value"),
      customUrl: byId("custom-url"),
      theme: byId("theme"),
      accent: byId("accent"),
      labels: byId("labels"),
      branding: byId("branding"),
      hostBase: byId("host-base"),
      api: byId("api"),
      badgeLabel: byId("badge-label"),
      linkTarget: byId("link-target"),
      sourceCount: byId("source-count"),
      themeReadout: byId("theme-readout"),
      statusGithub: byId("status-github"),
      statusGitlab: byId("status-gitlab"),
      statusNpm: byId("status-npm"),
      statusPypi: byId("status-pypi"),
      statusDocker: byId("status-docker"),
      statusPh: byId("status-ph"),
      previewShell: byId("preview-shell"),
      preview: byId("live-preview"),
      previewMeta: byId("preview-meta"),
      code: byId("code"),
      fileImport: byId("file-import")
    };

    state = loadDraft();
    bindEvents();
    refreshProjectSelect();
    syncForm();
    updateAll();
  }

  function bindEvents() {
    var fields = [
      "projectName", "github", "gitlab", "npm", "npmPeriod", "productHunt", "pypi",
      "pypiPeriod", "docker", "customLabel", "customValue", "customUrl", "theme",
      "accent", "labels", "branding", "hostBase", "api", "badgeLabel", "linkTarget"
    ];
    fields.forEach(function (key) {
      nodes[key].addEventListener("input", function () {
        readForm();
        saveDraft();
        updateAll();
      });
      nodes[key].addEventListener("change", function () {
        readForm();
        saveDraft();
        updateAll();
      });
    });

    document.querySelectorAll("[data-size]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.size = button.getAttribute("data-size");
        saveDraft();
        syncForm();
        updateAll();
      });
    });

    document.querySelectorAll("[data-accent]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.accent = button.getAttribute("data-accent");
        saveDraft();
        syncForm();
        updateAll();
      });
    });

    document.querySelectorAll("[data-preview-bg]").forEach(function (button) {
      button.addEventListener("click", function () {
        previewBg = button.getAttribute("data-preview-bg");
        syncButtons();
        renderPreview();
      });
    });

    document.querySelectorAll("[data-code-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        codeTab = button.getAttribute("data-code-tab");
        syncButtons();
        updateCode();
      });
    });

    byId("copy-code").addEventListener("click", copyCurrentCode);
    byId("copy-primary").addEventListener("click", copyCurrentCode);
    byId("new-project").addEventListener("click", newProject);
    byId("save-project").addEventListener("click", saveCurrentProject);
    byId("delete-project").addEventListener("click", deleteCurrentProject);
    byId("reset-project").addEventListener("click", resetProject);
    byId("export-project").addEventListener("click", exportProject);
    byId("import-project").addEventListener("click", importProject);

    nodes.projectSelect.addEventListener("change", function () {
      var project = getProjects().filter(function (item) {
        return item.id === nodes.projectSelect.value;
      })[0];
      if (project) {
        state = normalizeProject(project);
        saveDraft();
        syncForm();
        updateAll();
      }
    });

    nodes.fileImport.addEventListener("change", function () {
      var file = nodes.fileImport.files && nodes.fileImport.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          applyImportedProject(JSON.parse(String(reader.result || "{}")));
        } catch (err) {
          showToast("Could not read that project file");
        }
      };
      reader.readAsText(file);
      nodes.fileImport.value = "";
    });
  }

  function readForm() {
    state.name = nodes.projectName.value.trim() || "Untitled badge";
    state.github = nodes.github.value.trim();
    state.gitlab = nodes.gitlab.value.trim();
    state.npm = nodes.npm.value.trim();
    state.npmPeriod = nodes.npmPeriod.value;
    state.productHunt = nodes.productHunt.value.trim();
    state.pypi = nodes.pypi.value.trim();
    state.pypiPeriod = nodes.pypiPeriod.value;
    state.docker = nodes.docker.value.trim();
    state.customLabel = nodes.customLabel.value.trim();
    state.customValue = nodes.customValue.value.trim();
    state.customUrl = nodes.customUrl.value.trim();
    state.theme = nodes.theme.value;
    state.accent = nodes.accent.value || "#0f766e";
    state.labels = nodes.labels.checked;
    state.branding = nodes.branding.checked;
    state.hostBase = nodes.hostBase.value.trim();
    state.api = nodes.api.value.trim();
    state.badgeLabel = nodes.badgeLabel.value.trim() || "traction";
    state.linkTarget = nodes.linkTarget.value.trim();
  }

  function syncForm() {
    nodes.projectName.value = state.name || "";
    nodes.github.value = state.github || "";
    nodes.gitlab.value = state.gitlab || "";
    nodes.npm.value = state.npm || "";
    nodes.npmPeriod.value = state.npmPeriod || "week";
    nodes.productHunt.value = state.productHunt || "";
    nodes.pypi.value = state.pypi || "";
    nodes.pypiPeriod.value = state.pypiPeriod || "month";
    nodes.docker.value = state.docker || "";
    nodes.customLabel.value = state.customLabel || "";
    nodes.customValue.value = state.customValue || "";
    nodes.customUrl.value = state.customUrl || "";
    nodes.theme.value = state.theme || "auto";
    nodes.accent.value = state.accent || "#0f766e";
    nodes.labels.checked = state.labels !== false;
    nodes.branding.checked = state.branding !== false;
    nodes.hostBase.value = state.hostBase || "";
    nodes.api.value = state.api || "";
    nodes.badgeLabel.value = state.badgeLabel || "";
    nodes.linkTarget.value = state.linkTarget || "";
    syncButtons();
  }

  function syncButtons() {
    document.querySelectorAll("[data-size]").forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-size") === state.size);
    });
    document.querySelectorAll("[data-accent]").forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-accent").toLowerCase() === String(state.accent).toLowerCase());
    });
    document.querySelectorAll("[data-preview-bg]").forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-preview-bg") === previewBg);
    });
    document.querySelectorAll("[data-code-tab]").forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-code-tab") === codeTab);
    });
    nodes.themeReadout.textContent = labelForTheme(state.theme);
  }

  function updateAll() {
    var parsed = parseState();
    updateStatuses(parsed);
    syncButtons();
    renderPreview(parsed);
    updateCode(parsed);
  }

  function parseState() {
    var A = window.Aggredate || {};
    var gh = A.parseGitHub ? A.parseGitHub(state.github) : "";
    var gl = A.parseGitLab ? A.parseGitLab(state.gitlab) : "";
    var npm = A.parseNpm ? A.parseNpm(state.npm) : "";
    var pypi = A.parsePyPi ? A.parsePyPi(state.pypi) : "";
    var docker = A.parseDocker ? A.parseDocker(state.docker) : "";
    var phId = A.parsePhId ? A.parsePhId(state.productHunt) : "";
    var phSlug = parseProductHuntSlug(state.productHunt);
    return {
      github: gh,
      gitlab: gl,
      npm: npm,
      pypi: pypi,
      docker: docker,
      phId: phId,
      phSlug: phSlug,
      phParam: phId || phSlug,
      custom: Boolean(state.customLabel || state.customValue),
      activeCount: (gh ? 1 : 0) + (gl ? 1 : 0) + (npm ? 1 : 0) + (pypi ? 1 : 0) +
        (docker ? 1 : 0) + ((phId || phSlug) ? 1 : 0) + ((state.customLabel || state.customValue) ? 1 : 0)
    };
  }

  function updateStatuses(parsed) {
    setStatus(nodes.statusGithub, parsed.github || "Missing", Boolean(parsed.github), false);
    setStatus(nodes.statusGitlab, parsed.gitlab || "Missing", Boolean(parsed.gitlab), false);
    setStatus(nodes.statusNpm, parsed.npm || "Missing", Boolean(parsed.npm), false);
    setStatus(nodes.statusPypi, parsed.pypi || "Missing", Boolean(parsed.pypi), false);
    setStatus(nodes.statusDocker, parsed.docker || "Missing", Boolean(parsed.docker), false);
    if (parsed.phId) setStatus(nodes.statusPh, "id " + parsed.phId, true, false);
    else if (parsed.phSlug) setStatus(nodes.statusPh, parsed.phSlug, true, true);
    else setStatus(nodes.statusPh, "Missing", false, false);
    nodes.sourceCount.textContent = parsed.activeCount + (parsed.activeCount === 1 ? " active" : " active");
  }

  function setStatus(node, text, ok, warn) {
    node.textContent = text;
    node.classList.toggle("ok", ok && !warn);
    node.classList.toggle("warn", warn);
  }

  function renderPreview(parsed) {
    parsed = parsed || parseState();
    clearTimeout(renderTimer);
    renderTimer = setTimeout(function () {
      nodes.previewShell.className = "preview-shell " + previewBg;
      nodes.preview.innerHTML = "";

      if (!parsed.github && !parsed.gitlab && !parsed.npm && !parsed.pypi && !parsed.docker && !parsed.phId && !parsed.custom) {
        nodes.preview.innerHTML = '<div class="empty-preview">Add a source to preview the widget</div>';
        nodes.previewMeta.textContent = parsed.phSlug ? "Product Hunt URL works in README/API output" : "Ready";
        return;
      }

      var cfg = {
        github: parsed.github,
        gitlab: parsed.gitlab,
        npm: parsed.npm,
        npmPeriod: state.npmPeriod || "week",
        pypi: parsed.pypi,
        pypiPeriod: state.pypiPeriod || "month",
        docker: parsed.docker,
        phId: parsed.phId,
        phUrl: parsed.phId ? productHuntUrl(parsed) : "",
        customLabel: state.customLabel,
        customValue: state.customValue,
        customUrl: state.customUrl,
        api: state.api,
        theme: state.theme || "auto",
        accent: state.accent || "#0f766e",
        size: state.size || "md",
        labels: state.labels !== false,
        branding: state.branding !== false,
        brandUrl: trimSlash(state.hostBase || "https://your-site.com")
      };

      if (window.Aggredate && window.Aggredate.render) {
        window.Aggredate.render(nodes.preview, cfg);
        nodes.previewMeta.textContent = "Live browser preview";
      } else {
        nodes.preview.innerHTML = '<div class="empty-preview">Widget library unavailable</div>';
        nodes.previewMeta.textContent = "Missing aggredate.js";
      }
    }, 180);
  }

  function updateCode(parsed) {
    parsed = parsed || parseState();
    var code = "";
    if (codeTab === "inline") code = localSnippet(parsed);
    else if (codeTab === "readme") code = readmeSnippet(parsed);
    else if (codeTab === "backend") code = backendSnippet(parsed);
    else code = websiteSnippet(parsed);
    nodes.code.value = code;
  }

  function websiteSnippet(parsed) {
    var attrs = widgetAttributes(parsed);
    var base = trimSlash(state.hostBase || "https://your-site.com");
    return '<div data-aggredate\n' + attrs.map(function (attr) {
      return "     " + attr;
    }).join("\n") + "></div>\n\n" +
      '<script src="' + escapeAttr(base + "/aggredate.js") + '" async></script>';
  }

  function localSnippet(parsed) {
    var attrs = widgetAttributes(parsed);
    return '<div data-aggredate\n' + attrs.map(function (attr) {
      return "     " + attr;
    }).join("\n") + "></div>\n\n" +
      '<script src="./aggredate.js" async></script>';
  }

  function readmeSnippet(parsed) {
    var url = readmeBadgeUrl(parsed);
    var target = state.linkTarget || state.hostBase || "https://your-site.com";
    var alt = (state.badgeLabel || "Aggredate badge") + " badge";
    return "[![" + alt + "](" + url + ")](" + target + ")";
  }

  function backendSnippet(parsed) {
    var badge = apiBadgeUrl(parsed);
    var readme = readmeBadgeUrl(parsed);
    return "GET " + badge + "\n\n" +
      "README SVG\n" + readme + "\n\n" +
      "Environment variables for Product Hunt and higher GitHub limits:\n" +
      "PH_TOKEN=\nGITHUB_TOKEN=";
  }

  function widgetAttributes(parsed) {
    var attrs = [];
    if (parsed.github) attrs.push(attr("data-github", parsed.github));
    if (parsed.gitlab) attrs.push(attr("data-gitlab", parsed.gitlab));
    if (parsed.npm) {
      attrs.push(attr("data-npm", parsed.npm));
      attrs.push(attr("data-npm-period", state.npmPeriod || "week"));
    }
    if (parsed.pypi) {
      attrs.push(attr("data-pypi", parsed.pypi));
      attrs.push(attr("data-pypi-period", state.pypiPeriod || "month"));
    }
    if (parsed.docker) attrs.push(attr("data-docker", parsed.docker));
    if (parsed.phId) {
      attrs.push(attr("data-ph-id", parsed.phId));
      var phUrl = productHuntUrl(parsed);
      if (phUrl) attrs.push(attr("data-ph-url", phUrl));
    }
    if (state.customLabel) attrs.push(attr("data-custom-label", state.customLabel));
    if (state.customValue) attrs.push(attr("data-custom-value", state.customValue));
    if (state.customUrl) attrs.push(attr("data-custom-url", state.customUrl));
    if (state.theme && state.theme !== "auto") attrs.push(attr("data-theme", state.theme));
    else attrs.push(attr("data-theme", "auto"));
    if (state.accent) attrs.push(attr("data-accent", state.accent));
    if (state.size === "sm") attrs.push(attr("data-size", "sm"));
    if (state.labels === false) attrs.push(attr("data-labels", "false"));
    if (state.branding === false) attrs.push(attr("data-branding", "false"));
    if (state.hostBase) attrs.push(attr("data-brand-url", trimSlash(state.hostBase)));
    if (state.api) attrs.push(attr("data-api", state.api));
    if (!attrs.length) attrs.push(attr("data-theme", "auto"));
    return attrs;
  }

  function readmeBadgeUrl(parsed) {
    var base = trimSlash(state.hostBase || "https://your-site.com");
    var params = queryParams(parsed, true);
    return base + "/api/readme-badge" + (params ? "?" + params : "");
  }

  function apiBadgeUrl(parsed) {
    var endpoint = state.api || (trimSlash(state.hostBase || "https://your-site.com") + "/api/badge");
    var params = queryParams(parsed, false);
    return endpoint + (endpoint.indexOf("?") === -1 ? "?" : "&") + params;
  }

  function queryParams(parsed, includeStyle) {
    var items = [];
    if (parsed.github) items.push(["github", parsed.github]);
    if (parsed.gitlab) items.push(["gitlab", parsed.gitlab]);
    if (parsed.npm) {
      items.push(["npm", parsed.npm]);
      items.push(["npmPeriod", state.npmPeriod || "week"]);
    }
    if (parsed.pypi) {
      items.push(["pypi", parsed.pypi]);
      items.push(["pypiPeriod", state.pypiPeriod || "month"]);
    }
    if (parsed.docker) items.push(["docker", parsed.docker]);
    if (parsed.phParam) items.push(["ph", parsed.phParam]);
    if (includeStyle) {
      if (state.theme && state.theme !== "auto") items.push(["theme", state.theme]);
      if (state.accent) items.push(["accent", state.accent]);
      if (state.badgeLabel) items.push(["label", state.badgeLabel]);
    }
    return items.map(function (item) {
      return encodeURIComponent(item[0]) + "=" + encodeURIComponent(item[1]);
    }).join("&");
  }

  function productHuntUrl(parsed) {
    if (parsed.phSlug) return "https://www.producthunt.com/posts/" + parsed.phSlug;
    if (/producthunt\.com\/posts\//i.test(state.productHunt)) return state.productHunt;
    return "";
  }

  function parseProductHuntSlug(value) {
    var match = String(value || "").match(/producthunt\.com\/posts\/([^/?#\s"']+)/i);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function attr(name, value) {
    return name + '="' + escapeAttr(value) + '"';
  }

  function escapeAttr(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function labelForTheme(value) {
    if (value === "dark") return "Dark";
    if (value === "light") return "Light";
    return "Auto";
  }

  function copyCurrentCode() {
    copyText(nodes.code.value).then(function () {
      showToast("Copied");
    }, function () {
      showToast("Copy failed");
    });
  }

  function copyText(text) {
    if (window.aggredateDesktop && window.aggredateDesktop.copyText) {
      return window.aggredateDesktop.copyText(text);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    nodes.code.select();
    document.execCommand("copy");
    return Promise.resolve(true);
  }

  function newProject() {
    state = normalizeProject({
      id: uniqueId(),
      name: "Untitled badge",
      github: "",
      npm: "",
      productHunt: "",
      hostBase: "https://your-site.com",
      linkTarget: "https://your-site.com"
    });
    saveDraft();
    syncForm();
    updateAll();
    showToast("New project");
  }

  function saveCurrentProject() {
    var projects = getProjects();
    var existing = projects.filter(function (item) { return item.id === state.id; })[0];
    if (existing) {
      Object.assign(existing, clone(state));
    } else {
      projects.push(clone(state));
    }
    setProjects(projects);
    refreshProjectSelect();
    showToast("Project saved");
  }

  function deleteCurrentProject() {
    var projects = getProjects().filter(function (item) { return item.id !== state.id; });
    setProjects(projects);
    state = projects[0] ? normalizeProject(projects[0]) : clone(DEFAULT_PROJECT);
    saveDraft();
    refreshProjectSelect();
    syncForm();
    updateAll();
    showToast("Project deleted");
  }

  function resetProject() {
    state = normalizeProject(Object.assign({}, DEFAULT_PROJECT, { id: state.id || "default" }));
    saveDraft();
    syncForm();
    updateAll();
    showToast("Reset");
  }

  function exportProject() {
    var payload = normalizeProject(state);
    if (window.aggredateDesktop && window.aggredateDesktop.exportProject) {
      window.aggredateDesktop.exportProject(payload).then(function (result) {
        if (!result || result.canceled) return;
        showToast("Project exported");
      }, function () {
        showToast("Export failed");
      });
      return;
    }

    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = safeFileName(payload.name || "aggredate-project") + ".json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importProject() {
    if (window.aggredateDesktop && window.aggredateDesktop.importProject) {
      window.aggredateDesktop.importProject().then(function (result) {
        if (!result || result.canceled) return;
        applyImportedProject(result.project);
      }, function () {
        showToast("Import failed");
      });
      return;
    }
    nodes.fileImport.click();
  }

  function applyImportedProject(project) {
    state = normalizeProject(Object.assign({}, project, { id: project.id || uniqueId() }));
    saveDraft();
    syncForm();
    updateAll();
    showToast("Project imported");
  }

  function refreshProjectSelect() {
    var projects = getProjects();
    if (!projects.length) projects = [clone(DEFAULT_PROJECT)];
    nodes.projectSelect.innerHTML = "";
    projects.forEach(function (project) {
      var option = document.createElement("option");
      option.value = project.id;
      option.textContent = project.name || "Untitled badge";
      nodes.projectSelect.appendChild(option);
    });
    nodes.projectSelect.value = state.id || projects[0].id;
  }

  function getProjects() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(raw) ? raw.map(normalizeProject) : [];
    } catch (err) {
      return [];
    }
  }

  function setProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.map(normalizeProject)));
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(normalizeProject(state)));
  }

  function loadDraft() {
    try {
      var raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      return normalizeProject(raw || DEFAULT_PROJECT);
    } catch (err) {
      return clone(DEFAULT_PROJECT);
    }
  }

  function normalizeProject(project) {
    var out = Object.assign({}, DEFAULT_PROJECT, project || {});
    out.id = out.id || uniqueId();
    out.name = out.name || "Untitled badge";
    out.npmPeriod = /^(day|week|month|year)$/.test(out.npmPeriod) ? out.npmPeriod : "week";
    out.pypiPeriod = /^(day|week|month)$/.test(out.pypiPeriod) ? out.pypiPeriod : "month";
    out.theme = /^(auto|light|dark)$/.test(out.theme) ? out.theme : "auto";
    out.size = out.size === "sm" ? "sm" : "md";
    out.labels = out.labels !== false;
    out.branding = out.branding !== false;
    out.accent = /^#[0-9a-f]{6}$/i.test(out.accent || "") ? out.accent : "#0f766e";
    return out;
  }

  function trimSlash(value) {
    return String(value || "").replace(/\/+$/, "");
  }

  function safeFileName(value) {
    return String(value || "aggredate-project").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  }

  function uniqueId() {
    return "project-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function showToast(message) {
    var toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 1500);
  }
})();
