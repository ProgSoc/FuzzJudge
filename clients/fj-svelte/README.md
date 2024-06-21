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

Main client at: `http://localhost:1989/client/`
Standalone scoreboard page at: `http://localhost:1989/client/scoreboard/`
