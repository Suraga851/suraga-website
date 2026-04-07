FROM node:24-alpine

WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/web-next ./apps/web-next

RUN npm install --workspace apps/web-next --workspace packages/shared-types
RUN npm run build --workspace apps/web-next

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "apps/web-next"]
