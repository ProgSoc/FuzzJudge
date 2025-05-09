import { watch } from "node:fs/promises";
import { HEADER } from "./src/version";

let ab = new AbortController();

let exitPromise: Promise<number> | null = null;

const buildEntryPoints = ["./src/index.ts", "./src/client.ts"];
const serverEntryPoint = "dist/index.js";

const requestRestart = async () => {
	ab.abort();

	if (exitPromise) {
		const beforeWait = performance.now();
		await exitPromise;
		const afterWait = performance.now();
		console.log(
			`Waited ${Math.round(afterWait - beforeWait)}ms for process to exit`,
		);
		exitPromise = null;
	}

	ab = new AbortController();

	await Bun.build({
		entrypoints: buildEntryPoints,
		outdir: "./dist",
		target: "bun",
		sourcemap: "external",
		banner: `/** ${HEADER} */`,
	});

	const args = Bun.argv.slice(2);

	const proc = Bun.spawn(["bun", "run", serverEntryPoint, ...args], {
		stdio: ["inherit", "inherit", "inherit"],
		shell: true,
		signal: ab.signal,
	});

	exitPromise = proc.exited;
};

await requestRestart(); // Initial build

const srcWatcher = watch(`${import.meta.dir}/src`, { recursive: true });

for await (const event of srcWatcher) {
	await requestRestart();
}

process.on("SIGINT", () => {
	ab.abort();
	console.log("Watcher closed");
	process.exit(0);
});
process.on("SIGTERM", () => {
	ab.abort();
	console.log("Watcher closed");
	process.exit(0);
});
console.log("Watching for changes in src directory...");
