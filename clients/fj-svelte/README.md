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
npm run dev <PATH TO COMP>
```
If you have edited any of the icons, run `npm run build-icons` before building (requires Deno).

`<PATH TO COMP>` is optional, if not provided the sample questions will be used.
Requires Deno.
Note that ports 25566, 1989 and 8080 must be free and currently there is no good error handling for this.

Main client at: `http://localhost:1989/client/`

Standalone scoreboard page at: `http://localhost:1989/client/scoreboard/`
