# Home Media — frontend

React + TypeScript + Vite single-page app. In production it is built and embedded
into the Go binary (see the root `Makefile`); during development it runs on the
Vite dev server and talks to the backend at `http://localhost:8080/api`.

```sh
pnpm install
pnpm run dev     # http://localhost:5173
pnpm run lint
pnpm run build   # outputs to dist/
```

Optional settings live in `.env` (copy `.env.example`).
