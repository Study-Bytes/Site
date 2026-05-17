# StudyBytes Site deployment notes

## Required environment variables

The production build needs these Vite build-time variables:

```env
VITE_BFF_BASE_URL=https://studybytes.example.com
VITE_BFF_API_PREFIX=/api/v1
VITE_USE_MOCK_BFF=false
```

`VITE_BFF_BASE_URL` should point to the public BFF origin or to the same origin if Nginx routes `/api/v1` to BFF.

## BFF-only rule

The Site must not expose or call internal microservice URLs. The only backend target is BFF:

```text
Site -> BFF /api/v1/**
```

BFF owns internal routing to UserService, CourseService, LearningService and CodeExecutorService.

## Docker build

The Dockerfile accepts Vite build args:

```bash
docker build \
  --build-arg VITE_BFF_BASE_URL=https://studybytes.example.com \
  --build-arg VITE_BFF_API_PREFIX=/api/v1 \
  --build-arg VITE_USE_MOCK_BFF=false \
  -t studybytes-site .
```

## Static serving

The container serves the Vite `dist` bundle on port `3000`. For production, place Nginx or another reverse proxy in front of it.

Required reverse proxy behavior:

- serve Site static assets;
- route SPA fallback to `index.html`;
- route `/api/v1/**` to BFF if BFF is mounted on the same public domain;
- do not enable mock mode in production.

## CI

The Site CI workflow runs:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

The workflow intentionally does not include deployment until current deployment requirements are finalized.
