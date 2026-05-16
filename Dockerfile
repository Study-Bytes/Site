# Stage 1: build Vite -> dist
FROM node:alpine AS build
WORKDIR /app

ARG VITE_BFF_BASE_URL=/api
ARG VITE_USE_MOCK_BFF=false
ENV VITE_BFF_BASE_URL=$VITE_BFF_BASE_URL
ENV VITE_USE_MOCK_BFF=$VITE_USE_MOCK_BFF

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


# Stage 2: serve dist on :3000 (for separate nginx / reverse proxy)
FROM node:alpine AS runner
WORKDIR /app

COPY --from=build /app/dist ./dist

RUN npm i -g http-server-spa

EXPOSE 3000
CMD ["http-server-spa", "./dist", "index.html", "3000"]
