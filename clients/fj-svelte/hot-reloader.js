import { exec } from "child_process";
import { cpSync } from "fs";
import path from "path";
import watch from "watch";

import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  port: 9999,
});

let running = undefined;

let comp_dir = "../../sample";

let args = process.argv.slice(2);
if (args.length > 0) {
  comp_dir = args[0];
}

const ping_clients = () => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send("ping");
    }
  });
}

const build = () => {
  if (running) {
    return;
  }

  running = exec("npm run build", (err, stdout, stderr) => {
    cpSync(path.resolve("dist"), path.join(comp_dir, "client"), { recursive: true });
    console.log("Done!");
    running = undefined;
    ping_clients();
  });
};

watch.watchTree(path.resolve("src"), function(f, curr, prev) {
  console.log("Rebuilding...");
  build();
})

const deno_proc = exec(`deno run --watch -A ../../src/main.ts ${comp_dir}`, (err, stdout, stderr) => {
  console.log(err);
  console.log(stderr);
});
console.log("Started at http://localhost:1989/client/");

