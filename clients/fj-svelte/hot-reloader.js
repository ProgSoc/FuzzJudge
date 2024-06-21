import { spawn } from "child_process";
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

  running = spawn("npm", ["run", "build"], {
    stdio: "inherit",
    stderr: "inherit",
  });

  running.on("close", () => {
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

const deno_proc = spawn("deno", ["run", "--watch", "-A", path.resolve("../../src/main.ts"), path.resolve(comp_dir)], {
  stdio: "inherit",
  stderr: "inherit",
});

console.log("Staring client at http://localhost:1989/client/ ...");

build();
