# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY clients/fj-admin-html/package.json /temp/dev/clients/fj-admin-html/
COPY clients/fj-svelte/package.json /temp/dev/clients/fj-svelte/
COPY clients/fj-react/package.json /temp/dev/clients/fj-react/
COPY server/package.json /temp/dev/server/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY server/package.json /temp/prod/server/
COPY clients/fj-admin-html/package.json /temp/prod/clients/fj-admin-html/
COPY clients/fj-svelte/package.json /temp/prod/clients/fj-svelte/
COPY clients/fj-react/package.json /temp/prod/clients/fj-react/
RUN cd /temp/prod && bun install --frozen-lockfile --production --filter @progsoc/fuzzjudge-server

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun run -F @progsoc/* build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/server/dist server/dist
COPY --from=prerelease /usr/src/app/server/migrations server/migrations
COPY --from=prerelease /usr/src/app/package.json package.json
COPY --from=prerelease /usr/src/app/server/package.json server/package.json

# run the app
USER bun
EXPOSE 1989/tcp
ENTRYPOINT [ "bun", "run", "start" ]

FROM release AS release-runtimes

USER root

RUN echo http://dl-cdn.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories
# Install Different Programming Languages (apk)
RUN apk upgrade --no-cache

RUN apk add --no-cache \
    curl \
    python3 \
    py3-pip \
    gcc \
    g++ \
    make \
    deno

USER bun

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal


ENV PATH="/home/bun/.cargo/bin:$PATH"
