FROM node:26-bullseye AS builder

WORKDIR /app

# Build-Tools für native Module
RUN apt-get update && apt-get install -y python3 g++ make libc6-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Replace corepack usage with a direct pnpm install to avoid "corepack: not found"
RUN npm install -g pnpm@10.18.3

# Use frozen lockfile when available, otherwise fall back to no-frozen-lockfile
RUN pnpm install --no-frozen-lockfile

COPY . .

# Build für Production
RUN pnpm build
RUN pnpm prune --production

FROM node:26-bullseye

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", "build"]
