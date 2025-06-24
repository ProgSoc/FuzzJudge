# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install-prod

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY ./package.json bun.lock /temp/prod/
COPY ./server/package.json /temp/prod/server/
COPY ./clients/fj-admin-html/package.json /temp/prod/clients/fj-admin-html/
COPY ./clients/fj-svelte/package.json /temp/prod/clients/fj-svelte/
COPY ./clients/fj-react/package.json /temp/prod/clients/fj-react/
RUN cd /temp/prod && bun install --frozen-lockfile --production --filter @progsoc/fuzzjudge-server

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install-prod /temp/prod/node_modules node_modules
COPY ./server/dist server/dist
COPY ./server/migrations server/migrations
COPY ./package.json package.json
COPY ./server/package.json server/package.json

# run the app
USER bun
EXPOSE 1989/tcp
ENTRYPOINT [ "bun", "run", "start" ]

FROM base AS release-runtimes

RUN echo http://dl-cdn.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories
# Install Different Programming Languages (apk)
RUN apk upgrade --no-cache

RUN apk add --no-cache \
    bash \
    curl \
    python3 \
    py3-pip \
    gcc \
    g++ \
    make \
    deno
USER bun
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
USER root
COPY --from=install-prod /temp/prod/node_modules node_modules
COPY ./server/dist server/dist
COPY ./server/migrations server/migrations
COPY ./package.json package.json
COPY ./server/package.json server/package.json

ENV PATH="/home/bun/.cargo/bin:$PATH"
USER bun
EXPOSE 1989/tcp
ENTRYPOINT [ "bun", "run", "start" ]
