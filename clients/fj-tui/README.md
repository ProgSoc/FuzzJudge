# fj-tui
TUI FuzzJudge client. Allows for saving puzzle inputs directly to files and loading source files for submission without any copy and pasting. For features such as live scoreboard and full rendering of question instructions, instead use fj-svelte.

## Building
```
cargo build --release
```
Requires Rust. Output binary will be at `target/release/fj-tui`.

## Usage
```
fj-tui -s [SERVER] -u [USERNAME] -p [PASSWORD]
```
