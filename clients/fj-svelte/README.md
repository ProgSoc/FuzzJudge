# fj-svelte
Single page FuzzJudge frontend with live scoreboard.

Building and running:
```bash
npm install &&
npm run build &&
mkdir ../../sample/client &&
cp -a dist/. ../../sample/client/ &&
cd ../../ &&
deno run --watch -A src/main.ts sample
```
