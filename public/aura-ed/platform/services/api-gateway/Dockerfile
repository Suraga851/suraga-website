FROM node:24-alpine

WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY packages/shared-types ./packages/shared-types
COPY services/api-gateway ./services/api-gateway

RUN npm install --workspace services/api-gateway --workspace packages/shared-types
RUN npm run build --workspace packages/shared-types
RUN npm run build --workspace services/api-gateway

EXPOSE 8000

CMD ["node", "services/api-gateway/dist/server.js"]
