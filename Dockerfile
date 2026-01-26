# Stage 1: build Vite -> dist
FROM node:alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


# Stage 2: serve dist on :3000 (for your separate nginx)
FROM node:alpine AS runner
WORKDIR /app

COPY --from=build /app/dist ./dist

RUN npm i -g http-server-spa

EXPOSE 3000
CMD ["http-server-spa", "./dist", "index.html", "3000"]
