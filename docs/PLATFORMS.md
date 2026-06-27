# Supported Platforms

Aggredate supports public, low-friction sources first. Sources fail softly: if one platform is down or rate-limited, the rest of the badge still renders.

| Platform | Widget attribute | Metric | Backend parameter |
| --- | --- | --- | --- |
| GitHub | `data-github="owner/repo"` | Stars | `github=owner/repo` |
| GitLab | `data-gitlab="group/project"` | Stars | `gitlab=group/project` |
| Product Hunt | `data-ph-id="123456"` | Upvotes | `ph=123456` or `ph=post-slug` |
| npm | `data-npm="package"` | Downloads | `npm=package` |
| PyPI | `data-pypi="package"` | Downloads | `pypi=package` |
| Docker Hub | `data-docker="owner/image"` | Pulls | `docker=owner/image` |
| Custom | `data-custom-label`, `data-custom-value` | Static value | Not needed |

## GitHub

Accepts `owner/repo` or a GitHub URL. Browser widget uses the public GitHub API. The backend can use `GITHUB_TOKEN` for higher rate limits.

## GitLab

Accepts nested GitLab paths such as `group/subgroup/project` or a GitLab URL. Uses GitLab's public project API.

## Product Hunt

The browser widget uses Product Hunt's official embed image when a numeric post id is available. The backend can use Product Hunt GraphQL for numeric ids or slugs when `PH_TOKEN` is set.

## npm

Accepts package names, scoped packages, or npm package URLs. Periods: `day`, `week`, `month`, `year`.

## PyPI

Accepts package names or PyPI project URLs. Downloads come from the PyPIStats public API. Periods: `day`, `week`, `month`.

## Docker Hub

Accepts `owner/image`, Docker Hub URLs, or official image names like `nginx`, which normalize to `library/nginx`.

## Custom Metrics

Use custom metrics for platforms without a dependable public API, such as app stores, waitlists, marketplaces, newsletters, private beta users, or paid installs.
