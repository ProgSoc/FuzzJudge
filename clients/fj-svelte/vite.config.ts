import { resolve } from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        scoreboard: resolve(__dirname, "scoreboard/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      '@server': '../../server',
    },
  },
});
