# TF(J)M (The FuzzJudge Manual)
This is a guide intended for future ProgSoc executives or anyone who wants to host a programming competition with FuzzJudge. The document walks you though all of the necessary steps for creating and running a competition, creating custom FuzzJudge clients and maintaining this codebase.

## Contents
1. [Design Overview](#design-overview)
1. [Competition Structure](#competition-structure)
1. [Problem Structure](#problem-structure)
1. [Scoring System](#scoring-system)
1. [Running a Comp](#running-a-comp)
1. [API](#api)
1. [Maintaining FuzzJudge](#maintaining-fuzzjudge)

## Design Overview
The FuzzJudge server serves problem descriptions and randomised inputs, validates problem solutions, tracks each team's score and runs a timer for competition start and finish times.

A problem can be implemented in any programming language as long as it supports `stdin`, `stdout`, command-line arguments and return codes. Each team is assigned a seed which is given to the problem's generator ([fuzz method](#fuzz)) by the server. 
When the team then submits their solution, the problem's validator ([judge method](#judge)) is then given the submitted solution and the same seed that was used to generate that team's input. 
This way the only state that needs to be stored on the server is the team's seed! With the same seed, the same problem input can be regenerated and solved on the server to be compared with the submitted solution.

In addition to being agnostic to the language the problems are implemented in, the server has no one primary front-end and is designed such that competitors can connect however they want and building a custom client is straightforward.
The server has both a [static, JSON-less, HTML Basic Auth based API](#static-api) enabling super simple clients such as a CLI in languages and environments where JSON parsing and complex auth is non-trivial, and a [live WebSocket API](#live-api) for complex web clients that can receive scoreboard events and other live updates.

Problems and competition metadata is specified in code blocks within markdown files. 

### Limitations
1. The fact that problem inputs are randomized means that if one of the judgers is incorrect/broken for some seeds, then there is the possibility of unfair advantages for some teams. It is important that every problem is tested against an independently implemented solution with several thousand seeds using a script.
1. Compiled languages can slow down the server if the compiler is being run every time. Ensure that any problems implemented in C, C++ or a similar language use Makefiles.

## Competition Structure
> For full examples, see [the sample competition](https://github.com/ProgSoc/FuzzJudge/tree/main/sample).

All information for a competition including the problems is defined in a competition directory. A competition directory must contain a markdown document named `comp.md` which specifies details about the competition. The directory should look something like:
```
comp/
  comd.md
  client/
    index.html
  some-problem/
    prob.md 
    program.sh
  other-problem/
    prob.md 
    program.rs
```

The following is an example of a `comp.md` file.

```md
---toml
[server]
public = ["client"]

[times]
start = "2024-06-24T11:30:00+1000"
finish = "2025-06-24T03:30:00+1000"
freeze = 60
---

# ProgComp 2023

ProgSoc @ TechFest

## Runsheet

- 11:30 - Event start, teams set up
- 12:00 - Competition start
- 1:00 - Lunch comes (sandwiches/wraps)
- 3:00 - Scoreboard freeze
- 4:00 - Competition end, scoreboard unfreeze, announcing winners
```
### Server
the `[server]` section allows for some basic customisation of the server.
* `public` is a list of subdirectories of the competition directory that are served on endpoints of the same name. For example, `public = ["client"]` would serve the contents of `comp/client` on the `/client` endpoint.

### Times
The `[times]` section defines the start and finish times of the competition. 
* `start` is when the problem instructions become available and solutions can be submitted in RFC3339 format.
* `finish` is when solutions can no longer be submitted in RFC3339 format.
* `freeze` is the number of seconds before the `finish` where the scoreboard stops being updated. This is used to create suspense and uncertainty around who has won until it is announced.

### Competition Info
* The first large header in the document must be the competition title. In the example above it is `ProgComp 2023`.
* The remainder of the document should specify other details about the event relevant to competitors. This is available on an endpoint and some clients may choose to display it.

## Problem Structure
> For full examples, see [the sample competition](https://github.com/ProgSoc/FuzzJudge/tree/main/sample).

Problems are defined in subdirectories of the competition directory.
A problem directory must contain a markdown document called `prob.md` and any other required files. The following is an example of a `prob.md` file:
```md
---toml
[fuzz]
exec = ["cargo", "run", "--release", "--", "generate"]
env = {}

[judge]
exec = ["cargo", "run", "--release", "--quiet", "--", "validate"]

[problem]
points = 1
difficulty = 1
---

# 👋 Hello Programmers!

Say hello to your fellow programmers!

In this problem we'll be greeting people.

For example, `Linus` will be converted to `Hello Linus!`.

## Input

The first line contains a string `S` which is the name to be greeted.

`S` is at least one character long, and contains only letters.

## Output

Output the greeting to the name.
```

### Fuzz

The `[fuzz]` section is used to generate a team's unique problem input based on that team's unique seed.

```
[fuzz]
exec = ["deno", "run", "fuzz.ts"]
env = { KEY = 123 }
```

- `exec` is the command that generates the problem input.
- `env` sets environment variable for the command.

The `exec` command is executed in the path of the problem directory with the team's seed appended to the end of the specified arguments list. For example, the command above would be executed as `deno run fuzz.ts someseed123`. 
**The seed can be any string; not just a number.**
The command must print the generated problem input to `stdout`.

### Judge

The `[judge]` section takes the team's submitted solution and determines whether or not it is valid.

```
[judge]
exec = ["deno", "run", "judge.ts"]
```

The command is executed with the seed the same as the [fuzz method](#fuzz) but with the team's solution piped though `stdin`.
If the command exits with `0`, the submitted solution is correct. If the solution is incorrect, `stderr` will be sent to the client. 
This is useful for displaying errors regarding incorrect formatting in submissions.

### Problem Metadata

- **Title**: The first large header (e.g. `# FuzzJudge Problem`) in the document specifies the problem title.
- **Icon**: Any emoji (unicode RGI emoji) in the first large header specifies the problem's icon (e.g. `# 😄 FuzzJudge Problem`). This will be excluded from the problem title.
- **Brief**: The first paragraph in the document specifies a brief for the question.
- **Instructions**: The remainder of the document (including the brief) is the instructions for the problem. Any images included in the problem directory can be used in the document with the regular image syntax `![Some image](image.png)` and they will automatically be made public.

The `[problem]` section in the code block front matter is used to specify the difficulty and points.

```
[problem]
points = 20
difficulty = 3
```

- `points` is the number of points awarded for submitting a passing solution.
- `difficulty` is a difficulty rating where 1 is easy, 2 is medium and 3 is hard.


## Scoring System
Each problem is [worth a certain amount of points](#problem-metadata) and when a team solves that problem they are awarded that number of points.
Teams are first sorted by their points but if there is a tie the teams with the least penalty points is placed ahead. When the team solves a problem, they receive $t + 20f$ penalty points where $t$ is the number of minutes between the start of the competition and the moment the solution is accepted and $f$ is the number of previous failed attempts at that problem.

## Running a Comp
This section focussed on what you should do once you have your problems and `comp.md` set up.

### Preparing Problems.
Important things to remember when preparing problems:
* **DO NOT RUN UNTESTED PROBLEMS IN A COMPETITION.** Make sure each problem has had **at least** one person other than the author implement a solution and confirm that the output is correct. Keep a collaborative spreadsheet of which problems have been reviewed and tested and by how many people. It is also important to test problems against an independently implemented solution with thousands of seeds to ensure that there is nothing hiding. You have to automated this with a script for now.
* Problems where something has to be proven (i.e. "find the most optimal solution", "find the minimum") are often subject to disputes and incorrect implementations. They should be avoided.

### Handling Disputes
When a team has a dispute, there are a few things that should be considered:
1. If a competitor has been working to solve a problem for a long time and now believes the problem's implementation is incorrect, they will be extremely frustrated regardless of who is at fault.
1. The competitor's head is probably still deep in the problem itself and not thinking about the hours of volunteer work that went into creating it.

As an organiser, it's your responsibility to be empathetic towards the competitor's frustration and give them some leniency. If possible, manually review their solution being generous about other little mistakes and try your hardest to award them the points.

> Everything below this may be slightly outdated. Please check the admin section in fj-react for the latest administration features.

### The Admin Panel
There is an admin panel available at [/admin](#getadmin). The default login for the admin account is:
```
Username: admin
Password:
```
The panel allows you to:
* Create and edit teams/users and assign users to teams.
* Edit [clock times](#times).
* Check user submissions.

Updates performed in the admin panel will trigger events on the [live API](#live-api) and some clients will reflect the changes in real-time.

### Registering Teams and Users
TODO

### Configuring a front-end
Typically you will want to host a user-friendly web client such as fj-svelte. There are two ways to do this:
1. **Hosting through the FuzzJudge server:** If you have a static web client, you can put it into a subdirectory of the competition directory and add it to the `public` list in the `[server]` section of `comp.md` ([see here](#server)). Competitors should then connect to `https://<server>:1989/<client-endpoint>`.
1. **Hosting independently:** If you want to host a client independently, you will need to allow CORS requests from the server. Currently doing this requires proxying all requests but in the future there may be a way to configure allowed origins in `comp.md`.

#### Hosting fj-svelte through the server
1. `cd` into `clients/fj-svelte`.
2. Run `bun install` and `bun build`.
3. Copy the contents of `dist` into a subdirectory of your competition directory (e.g. `comp/client`).
4. Add `client` to the `public` list in the `[server]` section of `comp.md`.
5. Give competitors the URL `https://<server>:1989/client`.

### Recommended Hosting Setups
TODO

## API
TODO

## Maintaining FuzzJudge
### Repository Structure
TODO
### API versioning
TODO
### Design Philosophy
TODO
