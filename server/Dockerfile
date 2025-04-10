FROM denoland/deno:alpine-2.2.8 as base

# Set the working directory
WORKDIR /app

# Copy the necessary files
COPY . .

# Install dependencies
RUN deno cache --lock --no-check ./main.ts

# Run the application
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "./main.ts", "/competition"]

# Expose the port the app runs on
EXPOSE 1989

# ---
# Environment
# Add question execution environments (python and rust)
# ---

FROM base
# Install Python
RUN apk add --no-cache python3 py3-pip
# Install Python packages
RUN apk add --no-cache py3-numpy
# Install Rust
RUN apk add --no-cache rust cargo
# Install Node.js
RUN apk add --no-cache nodejs npm
# Install Java
RUN apk add --no-cache openjdk11
# Install Go
RUN apk add --no-cache go
# Install Ruby
RUN apk add --no-cache ruby