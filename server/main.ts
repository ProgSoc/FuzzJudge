import app from "./impl/app.ts";

if (import.meta.main) {
  await Deno.serve({
    port: 1989,
    handler: app.fetch,
    onError: (e) => {
      if (e instanceof Response) return e;
      else if (e instanceof Error)
        return new Response(`500 Internal Server Error\n\n${e.stack ?? e.message}`, { status: 500 });
      else return new Response(String(e), { status: 500 });
    },
  }).finished;
}