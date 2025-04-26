# fj-tui

TUI FuzzJudge client. Allows for saving puzzle inputs directly to files and loading source files for submission without any copy and pasting. For features such as live scoreboard and full rendering of problem instructions, instead use fj-svelte.

## Building

```
cargo build --release
```

Requires Rust. Output binary will be at `target/release/fj-tui`.

## Usage

```
fj-tui -s [SERVER] -u [USERNAME] -p [PASSWORD]
```

### Keys

- Change problem: **LeftArrow**/**RightArrow** or `h`/`j`.
- Scrolling instructions: **UpArrow**/**DownArrow** or Vim motions (currently incomplete).
- Enter console: `:`
- Scrolling console: **PgUp**/**PgDown**.

### Console commands

The console works similar a normal shell. You are able to run system commands, pipe data and write to files.

**Commands:**

- `fuzz <slug>`
- `judge <slug> <source-path>` (solution should be piped)

**Example usage:**

- Save problem input of selected problem: `fuzz $s > $s.txt`
- Submit static answer to selected problem: `echo "2" | judge $s solve.py`
- Submit answer from python script: `cat $s.txt | python solve.py | judge $s solve.py`
- Create python solve script for selected problem: `echo "problemInput = \"\"\"$(fuzz $s)\"\"\"" > solve_$s.py`

**Variables**

- `$s`: id of selected question.
- `$q`: id of question in certain contexts (see below)

### Arguments

```
Usage: fj-tui [OPTIONS] --server <SERVER> --username <USERNAME>

Options:
  -s, --server <SERVER>
          URL of the server to connect to
  -u, --username <USERNAME>
          Username to login with
  -p, --password <PASSWORD>
          Password to login with [default: ]
      --on-recieve-problem <ON_RECIEVE_PROBLEM>
          Command to run when a new problem is recieved. `$q` will be set to
          the problem ID. (remember to escape `$` in your terminal)
          Example: `--on-recieve-problem "mkdir prob ; fuzz \$q > prob/\$q.txt"`
  -h, --help
          Print help
  -V, --version
          Print version
```
