# fj-svelte

Single page FuzzJudge frontend with live scoreboard.

## Building

```sh
bun install
bun run build
```
Output will be in `./dist`. This is a fully static site.

## Debugging

```sh
bun install
bun run dev
```
* To avoid CORS issues while debugging, by default the backend on `localhost:1989` is proxied to `/api`. 
* You can configure the backend location in the `.env` file.

# Shortcuts
* `Esc` - Close popup
* `Ctrl + I` - Open problem input
* `Ctrl + D` - Download problem input
* `Ctrl + Alt + C` - Copy problem input
* `Ctrl + S` - Open scoreboard
* `Ctrl + P` - Toggle question list
* `Ctrl + M` - Open FuzzJudge manual
* `Ctrl + Alt + Enter` - Submit solution
* `Ctrl + Alt + V` - Paste clipboard into solution box

# Contributing
Contributions are welcome.
* If you have edited any of the icons, run `bun run build-icons` before building.
* To add a theme, add the colour variables to `themes/themes.css` and then add the definition to the `Theme` enum in `themes/themes.ts`.
* If anyone is good with Vite plugins moving the icons data URI script to a Vite plugin would be appreciated.
