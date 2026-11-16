FROM node:24-slim AS build
WORKDIR /app
RUN corepack enable

# Dependencies first so Docker caches them between source changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
# Nitro bundles its runtime dependencies into .output, so node_modules is not needed.
COPY --from=build /app/.output ./.output
EXPOSE 3000
USER node
CMD ["node", ".output/server/index.mjs"]
