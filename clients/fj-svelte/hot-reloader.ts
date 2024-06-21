import { WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";
import { copySync } from "https://deno.land/std@0.224.0/fs/copy.ts";
import { join } from "https://deno.land/std@0.223.0/path/mod.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";

const wss = new WebSocketServer(25566);

let running: boolean = false;

let comp_dir = "../../sample";

if (Deno.args.length > 0) {
  comp_dir = Deno.args[0];
}

console.log(`Running from ${comp_dir}`);

const ping_clients = () => {
  for (const client of wss.clients) {
    client.send("ping");
  }
};

const build = () => {
  if (running) {
    return;
  }

  const proc = new Deno.Command("npm", {
    args: ["run", "build"],
  }).spawn();
  running = true;

  proc.output().then(() => {
    const client_dir = join(comp_dir, "client");

    if (existsSync(client_dir)) {
      Deno.removeSync(client_dir, { recursive: true });
    }

    copySync("dist", client_dir);
    console.log("Done!");
    running = false;
    ping_clients();
  });
};

const proc = new Deno.Command("deno", {
  args: ["run", "--watch", "-A", "../../src/main.ts", comp_dir],
}).spawn();

const _ = proc.output();

console.log("Staring client at http://localhost:1989/client/ ...");

build();

const watcher = Deno.watchFs("src");

for await (const _ of watcher) {
  console.log("Rebuilding...");
  build();
}
