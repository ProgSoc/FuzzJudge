FROM denoland/deno

WORKDIR /app
COPY ./src ./src

EXPOSE 8000
CMD ["run", "-A", "src/main.ts", "/competition"]
