# StudyBytes Site deployment

This document describes the current VPS deployment model for the StudyBytes Site.

## Deployment model

The Site is a Vite SPA built into static assets and served from a Docker container on port `3000`.

Production traffic should be handled by Nginx or another reverse proxy in front of the container.

```text
Browser -> Nginx -> Site container :3000
Browser -> Nginx /api/v1/** -> BFF
```

The Site must call only the BFF public API. It must not call UserService, CourseService, LearningService, or CodeExecutorService directly.

## Required GitHub organization secrets

The CD workflow uses organization secrets:

```text
VPS_HOST
VPS_PORT
VPS_USER
VPS_SSH_KEY
VPS_DEPLOY_BASE_PATH
STUDYBYTES_BACKEND_NETWORK
```

The Site deploy path is derived from the base path:

```text
${VPS_DEPLOY_BASE_PATH}/site
```

Example:

```text
/opt/studybytes/site
```

## Expected VPS layout

```text
${VPS_DEPLOY_BASE_PATH}/site
  .git
  .env
  Dockerfile
  docker-compose.yml
  package.json
  src/
```

## First-time VPS setup

Run these commands once on the VPS. Replace values with the real repository URL and user.

```bash
sudo mkdir -p /opt/studybytes
sudo chown -R "$USER:$USER" /opt/studybytes

cd /opt/studybytes
git clone git@github.com:Study-Bytes/Site.git site
cd /opt/studybytes/site
```

Create the external Docker network if it does not already exist:

```bash
docker network create studybytes-backend || true
```

Create the production `.env` file:

```bash
cat > .env <<'EOF_ENV'
VITE_BFF_BASE_URL=
VITE_BFF_API_PREFIX=/api/v1
VITE_USE_MOCK_BFF=false
STUDYBYTES_BACKEND_NETWORK=studybytes-backend
EOF_ENV
```

If BFF is exposed on a separate public origin, set `VITE_BFF_BASE_URL` explicitly:

```env
VITE_BFF_BASE_URL=https://api.studybytes.example.com
VITE_BFF_API_PREFIX=/api/v1
VITE_USE_MOCK_BFF=false
STUDYBYTES_BACKEND_NETWORK=studybytes-backend
```

Start Site manually for the first time if needed:

```bash
docker compose up -d --build
docker compose ps
```

## Docker Compose

`docker-compose.yml` builds the Site image locally on the VPS and passes Vite build args from `.env`:

```text
VITE_BFF_BASE_URL
VITE_BFF_API_PREFIX
VITE_USE_MOCK_BFF
```

The Site container is attached to the external backend network configured through:

```text
STUDYBYTES_BACKEND_NETWORK
```

The Site container exposes port `3000` only inside Docker networks. It does not publish the port to the host by default.

If you use host-level Nginx instead of containerized Nginx, either run Nginx with Docker network access or intentionally add a host port mapping in a local override file.

## Production environment rules

Production `.env` must contain:

```env
VITE_USE_MOCK_BFF=false
VITE_BFF_API_PREFIX=/api/v1
```

`VITE_BFF_BASE_URL` should be empty when Nginx proxies `/api/v1/**` to BFF on the same origin.

It should be set only when BFF is served on a separate public origin.

## Nginx expectations

Nginx should:

- serve the Site public domain;
- proxy frontend SPA routes to the Site container;
- proxy `/api/v1/**` to the BFF;
- return `index.html` for unknown frontend routes;
- preserve WebSocket/upgrade headers if BFF later needs them.

Example container-network upstreams:

```nginx
upstream studybytes_site {
    server studybytes-site:3000;
}

upstream studybytes_bff {
    server studybytes-bff:8080;
}

server {
    listen 443 ssl http2;
    server_name studybytes.example.com;

    location ^~ /api/v1/ {
        proxy_pass http://studybytes_bff;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location / {
        proxy_pass http://studybytes_site;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

## CD workflow

The Site CD workflow is located at:

```text
.github/workflows/site-cd.yml
```

It runs validation first:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Then it deploys over SSH:

```bash
cd "${VPS_DEPLOY_BASE_PATH}/site"
git config --global --add safe.directory "${VPS_DEPLOY_BASE_PATH}/site"
test -f .env
git fetch origin main
git checkout main
git pull --ff-only origin main
docker compose up -d --build
docker compose ps
```

The workflow also checks that production `.env` contains:

```text
VITE_USE_MOCK_BFF=false
```

## Manual deployment

If GitHub Actions is unavailable, deploy manually:

```bash
cd /opt/studybytes/site
git fetch origin main
git checkout main
git pull --ff-only origin main
docker compose up -d --build
docker compose ps
```

Check Site container health:

```bash
docker compose exec -T site node -e "fetch('http://127.0.0.1:3000').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
```

View logs:

```bash
docker compose logs -f site
```

## CI

The Site CI workflow is located at:

```text
.github/workflows/site-ci.yml
```

It runs lint, typecheck, tests, and build on pushes and pull requests.
