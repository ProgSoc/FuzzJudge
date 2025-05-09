import fs from "node:fs/promises";
import { HEADER } from "./src/version";

const buildEntryPoints = ["./src/index.ts", "./src/client.ts"];

await fs.cp(
	`${import.meta.dir}/migrations`,
	`${import.meta.dir}/dist/migrations`,
	{
		recursive: true,
		force: true,
		errorOnExist: false,
	},
);

await Bun.build({
	entrypoints: buildEntryPoints,
	outdir: "./dist",
	target: "bun",
	sourcemap: "external",
	banner: `/** ${HEADER} */`,
});
