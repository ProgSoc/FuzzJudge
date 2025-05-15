import { HEADER } from "./src/version";

const buildEntryPoints = ["./src/index.ts"];

await Bun.build({
	entrypoints: buildEntryPoints,
	outdir: "./dist",
	target: "bun",
	sourcemap: "external",
	banner: `/** ${HEADER} */`,
});
