# Tool Discovery Hub

Free, independent, English-language tool directory. Plain HTML/CSS/JavaScript with no runtime dependencies, API, backend, payments, analytics, or advertising.

## GitHub Pages layout

The site is at the repository root: `index.html`, the other 18 pages, `assets/`, `data/`, `config.js`, `robots.txt`, and `sitemap.xml`.

Planned URL: **https://haya-studio.github.io/tool-discovery-hub/**

For branch-based GitHub Pages, use the chosen branch and **/ (root)** as the source directory. `.nojekyll` allows the generated static files to be served without Jekyll processing. If using an artifact-based workflow instead, use the repository root's site files as the artifact root. No workflow, push, commit, or deployment is performed by these scripts.

Internal links and asset references are relative, so navigation works beneath `/tool-discovery-hub/` and in local previews. Canonical and `og:url` values are absolute production URLs. The home page canonical is the directory URL with its trailing slash.

## Configure and build

Edit `config.js`:

- `siteName`: public site name.
- `siteUrl`: complete HTTPS site URL, including the repository path and trailing slash. Already set to the planned URL above.
- `email`: optional contact email. Keep empty until available.
- `toolFormUrl` and `problemFormUrl`: optional public HTTPS Google Forms links. Keep empty until the forms are ready.

Run from the repository root:

```sh
node build.cjs
node verify.cjs
```

Node is needed only when generating and checking files, never by visitors. The build regenerates all 19 HTML pages, `sitemap.xml`, and `robots.txt`. Configuration changes require rebuilding. Empty email and form settings produce no email/form links. Do not put secrets in this public configuration.

The verifier checks all page links and assets, production canonical/OGP/sitemap/robots URLs, data relationships, hidden forms/email, HTML escaping, and search/filter behavior with a minimal DOM. It does not substitute for visual testing in desktop and mobile browsers.

## Add or update content

Edit `data/directory.json`, then rebuild and verify. Categories use unique IDs. Tools have a unique `id`, name, category, summary, official HTTPS URL, features, limits, and related problem IDs. Pricing accepts `free`, `paid`, `unknown`; signup accepts `yes`, `no`, `unknown`. Label uncertainty honestly. A listing for a free tools collection does not describe every product from that provider.

Problems have a unique ID, title, category, and description. Tools' `problems` arrays establish the relationships. Problems with no matching tools are marked open. Detail HTML is generated at build time and remains readable without JavaScript. JavaScript enables live search and filtering. When intentionally retiring a record, also remove its old generated detail page; the builder does not delete pages.

Source text is HTML escaped and outgoing tool/form URLs allow HTTPS only. Search input is never inserted as HTML. Published pages do not evaluate code or load remote scripts/fonts. The Node builder executes trusted local configuration in a VM; do not run untrusted configuration files.

## Before publication

- Confirm the site name, production URL, policies, and contact availability.
- Review the five initial services' official sources and update review dates when appropriate. Initial descriptions were reviewed November 7, 2026; no hands-on testing is claimed.
- Initial problems are editorial examples, not real user submissions. Featured cards have no paid ranking.
- Before enabling forms, review permissions, data collection, retention, and the privacy policy against your actual operation.
- Text OGP is supplied; there is no fabricated social sharing image. Add an absolute `og:image` URL if an appropriate image is prepared later.
- The pre-existing `haya-tool-template-v1.zip` archive is retained locally and ignored by Git. It is not used by the site or build; do not upload it in a Pages artifact.

Open `index.html` locally or use any static HTTP server for preview. Browsing needs no fetch calls.

## Connected submission forms

- Submit Your Tool: https://forms.gle/x6vDCQwPXNwbWRnN9
- Submit a Problem: https://forms.gle/GoViUrtw7d8HHGfZ8

These configured links appear on the contribution page and in every page's footer. Existing navigation and editorial contribution links still lead to `submit.html`. Submissions are free and reviewed manually; no response is imported into the directory automatically. No Google login integration or API key is used by this site. Confirm in a signed-out/private browser that both Google Forms accept responses with the desired access settings before publication; that setting is controlled by Google Forms, not this repository.
