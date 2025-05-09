import { HEADER } from "./src/version";

const buildEntryPoints = ["./src/index.ts", "./src/client.ts"];

await Bun.build({
	entrypoints: buildEntryPoints,
	outdir: "./dist",
	target: "bun",
	sourcemap: "external",
	banner: `/** ${HEADER} */`,
});
