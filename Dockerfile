# Stage 1: Generate static pages from canonical source
FROM node:22-alpine AS page-builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY scripts ./scripts
COPY site-src ./site-src
COPY public ./public

RUN npm run build:pages

# Stage 2: Native C backend runtime (nginx)
FROM nginx:1.27-alpine

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=page-builder /app/public /usr/share/nginx/html

ENV PORT=8080
EXPOSE 8080
