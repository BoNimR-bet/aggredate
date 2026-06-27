# Widget API

`aggredate.js` is dependency-free and works on static sites.

## Basic Embed

```html
<div data-aggredate
     data-github="owner/repo"
     data-npm="package"
     data-theme="auto"></div>
<script src="aggredate.js" async></script>
```

## Attributes

| Attribute | Example | Description |
| --- | --- | --- |
| `data-github` | `owner/repo` | GitHub stars. |
| `data-gitlab` | `group/project` | GitLab stars. |
| `data-ph-id` | `123456` | Product Hunt post id for official live badge. |
| `data-ph-url` | Product Hunt URL | Optional click target. |
| `data-npm` | `@scope/pkg` | npm downloads. |
| `data-npm-period` | `week` | `day`, `week`, `month`, or `year`. |
| `data-pypi` | `requests` | PyPI downloads through PyPIStats. |
| `data-pypi-period` | `month` | `day`, `week`, or `month`. |
| `data-docker` | `owner/image` | Docker Hub pulls. |
| `data-custom-label` | `waitlist` | Static custom label. |
| `data-custom-value` | `1.2k` | Static custom value. |
| `data-custom-url` | URL | Optional custom click target. |
| `data-theme` | `auto` | `auto`, `light`, or `dark`. |
| `data-accent` | `#0f766e` | Accent color. |
| `data-size` | `sm` | `md` or `sm`. |
| `data-labels` | `false` | Hide text labels. |
| `data-branding` | `false` | Hide Aggredate credit. |
| `data-api` | `/api/badge` | Use the backend for unified counts. |

## Programmatic Use

```js
Aggredate.render(element, {
  github: "owner/repo",
  gitlab: "group/project",
  npm: "package",
  pypi: "requests",
  docker: "library/nginx",
  theme: "dark"
});

Aggredate.init();
Aggredate.format(12345); // "12.3k"
```

## Backend Response

```json
{
  "github": 90123,
  "gitlab": 420,
  "npm": 845210,
  "pypi": 300,
  "docker": 1200300,
  "producthunt": 540
}
```
