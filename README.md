# Aggredate Studio

Aggredate is a desktop editor plus a tiny embeddable widget for showing live product traction in one badge strip.

It helps makers turn scattered proof into one editable widget:

- GitHub stars
- GitLab stars
- Product Hunt upvotes
- npm downloads
- PyPI downloads
- Docker Hub pulls
- custom static metrics like waitlist users, revenue, installs, or launch rank

The app edits projects locally, previews the widget live, and generates copy-paste code for websites, local HTML, README badges, and the optional API backend.

## What Is In This Repo

| Path | Purpose |
| --- | --- |
| `index.html` | Aggredate Studio desktop/web editor UI. |
| `app/renderer.js` | Editor state, live preview, snippets, import/export. |
| `app/styles.css` | Desktop-first UI styling. |
| `electron/main.js` | Electron window, clipboard, import/export dialogs. |
| `electron/preload.js` | Safe renderer bridge. |
| `aggredate.js` | Dependency-free website widget. |
| `api/badge.js` | Optional Vercel JSON API for cached counts. |
| `api/readme-badge.js` | SVG badge endpoint for GitHub READMEs. |
| `docs/` | Platform, widget, app, and packaging docs. |
| `test/test.js` | Offline unit tests with mocked network calls. |

## Install

```bash
npm install
```

## Run The Desktop App

```bash
npm run app:dev
```

The same `index.html` can also be opened in a browser for local editing, but Electron adds native clipboard and JSON import/export dialogs.

## Run Tests

```bash
npm test
```

Tests are offline and mock GitHub, GitLab, npm, PyPI, Docker Hub, and Product Hunt.

## Build Installers

```bash
npm run dist:win
npm run dist:linux
npm run dist:mac
```

Artifacts are written to `dist/`.

Windows builds produce NSIS and portable packages. Linux builds produce AppImage and `.deb`. macOS builds produce DMG and zip. Build macOS installers on macOS for reliable signing/notarization.

More details: [docs/PACKAGING.md](docs/PACKAGING.md).

## Website Widget Quick Start

```html
<div data-aggredate
     data-github="owner/repo"
     data-gitlab="group/project"
     data-npm="my-package"
     data-pypi="my-python-package"
     data-docker="owner/image"
     data-ph-id="123456"></div>

<script src="https://your-site.com/aggredate.js" async></script>
```

The script finds every `[data-aggredate]` element and renders the live widget.

## README Badge Quick Start

GitHub READMEs do not run JavaScript. Use the SVG endpoint:

```md
[![traction](https://your-site.com/api/readme-badge?github=owner/repo&npm=my-package&docker=owner/image)](https://your-site.com)
```

## Optional Backend

The widget can fetch public counts directly in the browser. The backend is useful when you want:

- one unified style for Product Hunt counts
- server-side caching
- higher GitHub rate limits with `GITHUB_TOKEN`
- README SVG badges

```txt
GET /api/badge?github=owner/repo&gitlab=group/project&npm=pkg&pypi=pkg&docker=owner/image&ph=123456
```

Deploy this repo to Vercel and set:

```txt
PH_TOKEN=
GITHUB_TOKEN=
```

## Documentation

- [Desktop app](docs/DESKTOP_APP.md)
- [Supported platforms](docs/PLATFORMS.md)
- [Widget API](docs/WIDGET_API.md)
- [Packaging and installers](docs/PACKAGING.md)
- [Monetization notes](MONETIZATION.md)

## License

MIT. See [LICENSE](LICENSE).
