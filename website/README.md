# Home Media website

The static marketing site for Home Media. Plain HTML, CSS and JavaScript: no build step, no dependencies, no third-party requests.

```
website/
├── index.html             # the landing page
├── 404.html               # not-found page (uses root-relative /assets paths)
├── robots.txt, sitemap.xml
├── package.sh             # builds the upload zip into dist/
└── assets/
    ├── css/site.css       # the single theme and all layout
    ├── js/site.js         # shelf picker, catalog demo, theme preview, compose generator
    ├── fonts/             # Archivo variable font (SIL Open Font License, see OFL.txt)
    └── img/               # favicon and social preview image
```

## Preview locally

Serve the folder over HTTP (fonts don't load from `file://`):

```sh
python3 -m http.server 8765 --directory website
# or
pnpm dlx serve website
```

Then open http://localhost:8765.

## Deploy

Build the upload zip:

```sh
./website/package.sh                # -> website/dist/home-media-website.zip
./website/package.sh ~/Downloads/hm.zip   # or any path you like
```

The zip has `index.html` at its top level and contains only the site files (no README, script or `dist/`). Upload it to any static host. `dist/` is git-ignored.

- `404.html` loads its assets from `/assets/...`, so it expects the site to live at the root of a domain. If you host it under a sub-path, update those paths.
- The site is hosted at https://hm.rustydaemon.com. That domain is written into the canonical link, the `og:url` / `og:image` / `twitter:image` tags in `index.html`, `robots.txt` and `sitemap.xml`. Update all of them if the domain changes.

## Keeping it accurate

The demos mirror the app's real options: formats, content types, editions, availability states, languages and the eight themes come from `backend/seeding/seeder.go` and `frontend/src/index.css`. The compose generator follows the examples in the root `README.md`. Update `assets/js/site.js` when those change.
