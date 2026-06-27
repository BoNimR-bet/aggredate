# Desktop App

Aggredate Studio is the editable desktop version of the widget generator.

## Main Workflow

1. Enter a project name.
2. Add any supported sources.
3. Adjust theme, accent, size, labels, and branding.
4. Preview the badge.
5. Copy the generated website, local HTML, README, or API output.

## Projects

Projects are stored locally in browser/Electron storage.

- New creates a blank local project.
- Save stores the current project in the app's local project list.
- Delete removes the current local project.
- Reset restores the default sample project.
- Import reads an exported `.json` project.
- Export writes the current project to a `.json` file.

## Output Tabs

| Tab | Use |
| --- | --- |
| Website | Hosted snippet using `https://your-site.com/aggredate.js`. |
| Local | Relative snippet using `./aggredate.js`. |
| README | Markdown image link backed by `/api/readme-badge`. |
| API | Direct `/api/badge` and `/api/readme-badge` URLs. |

## Product Hunt Note

The website widget can show Product Hunt's official live badge when you provide a numeric `post_id`. Product Hunt URL slugs are supported for README/API output when `PH_TOKEN` is configured on the backend.
