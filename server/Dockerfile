FROM denoland/deno:alpine-2.2.8 AS base

# Install Deno
RUN apk add --no-cache deno
# Install Python
RUN apk add --no-cache python3 py3-pip
# Install Python packages
RUN apk add --no-cache py3-numpy
# Install Rust
RUN apk add --no-cache rust cargo
# Install Java
RUN apk add --no-cache openjdk11
# Install Go
RUN apk add --no-cache go
# Install Ruby
RUN apk add --no-cache ruby

# Set the working directory
WORKDIR /app

# Copy the necessary files
COPY . .

# Fix https://github.com/denoland/deno_docker/issues/373
ENV LD_LIBRARY_PATH /usr/lib:/usr/local/lib
ARG BASE_PATH
# Set the environment variable for the backend URL
ENV BASE_PATH=$BASE_PATH

# Install dependencies
RUN deno cache --lock --no-check ./main.ts

# Run the application
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-env","./main.ts", "/competition"]

# Expose the port the app runs on
EXPOSE 1989