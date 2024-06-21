# fj-svelte
Single page FuzzJudge frontend with live scoreboard.

## Building
```sh
npm install
npm run build
```
Output will be in `./dist`

## Starting dev server
```sh
npm install
npm run fuzzjudge-build <PATH TO COMP>
```
Requires deno. Note that ports 9999, 1989 and 8080 must be free and currently there is no good error handling for this.



Main client at: `http://localhost:1989/client/`
Standalone scoreboard page at: `http://localhost:1989/client/scoreboard/`

