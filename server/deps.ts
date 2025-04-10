export {
  compress as compressZstd,
  decompress as decompressZstd,
  init as initZstd,
} from "https://deno.land/x/zstd_wasm@0.0.21/deno/zstd.ts";
export { DB } from "https://deno.land/x/sqlite/mod.ts";
export * as TermColours from "https://deno.land/std/fmt/colors.ts";

// i really don't like this :cry:
// i miss my no-magic https imports - oli
export {
  basename,
  dirname,
  join as pathJoin,
  normalize,
} from "jsr:@std/path@^1.0.0-rc.2";
export { accepts, serveFile } from "jsr:@std/http@^0.224.5";
export { walkSync } from "jsr:@std/fs@^0.223.0";
export * as TOML from "jsr:@std/toml@^0.223.0";
export * as YAML from "jsr:@std/yaml@^0.223.0";