FROM denoland/deno:alpine-2.2.8

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