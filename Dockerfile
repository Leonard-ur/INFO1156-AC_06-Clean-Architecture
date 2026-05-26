FROM node:lts-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

EXPOSE 3000
EXPOSE 5555

ENTRYPOINT ["pnpm", "run", "start:dev"]
