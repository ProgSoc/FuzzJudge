# TF(J)M (The FuzzJudge Manual)
This is a guide intended for future ProgSoc executives or anyone who wants to host a programming competition with FuzzJudge. The document walks you though all of the necessary steps for creating and running a competition, creating custom FuzzJudge clients and maintaining this codebase.

## Contents
1. [Design Overview](#design-overview)
1. [Competition Structure](#running-a-competition)
1. [Problem Structure](#problem-structure)
1. [Running a Comp](#running-a-comp)
1. [Static API](#static-api)
1. [Live API](#live-api)
1. [Maintaining FuzzJudge](#maintaining-fuzzjudge)

## Design Overview
The FuzzJudge server serves problem descriptions and inputs, validates problem solutions, tracks each team's score and runs a timer for competition start and finish times.

A problem can be implemented in any programming language as long as it supports stdin, stdout, command-line arguments and return codes. Each team is assigned a seed which is passed to the problem's generator (fuzz method) by the server as an argument and then the generator prints the problem input to stdout. 
When the team then submits their solution, the problem's validator (judge method) is run with the team's solution piped in and the same seed as an argument. 
This way the only state that needs to be stored on the server is the team's seed! With the same seed, the same problem input can be regenerated and solved on the server to be compared with the submitted solution. The return code then indicates whether or not the submitted solution was valid.

In addition to being agnostic to the language the problems are implemented in, the server has no one front-end and is designed such that competitors can connect however they want building a custom client is straightforward.
The server has both a [static, JSON-less, HTML Basic Auth based API](#static-api) enabling super simple clients such as a CLI in languages and environments where JSON parsing and complex auth is non-trivial, and a [live WebSocket API](#live-api) for web clients that can receive scoreboard events and other live updates.

Problems and competition metadata is specified in code blocks within markdown files. 

## Competition Structure

TODO

## Problem Structure
> For full examples, see [the sample questions](https://github.com/ProgSoc/FuzzJudge/tree/main/sample).

A problem directory should contain a markdown document `prob.md` and any other required files.

### Fuzz

The `[fuzz]` section in the code block front matter is used to generate a team's unique problem input based on that team's unique seed.

```
[fuzz]
exec = ["deno", "run", "fuzz.ts"]
env = { KEY = 123 }
```

- `exec` is the command to be run to generate the problem input.
- `env` is any any environment variables to set for the command.

The `exec` is executed in the path of the problem directory with the seed appended to the end of the specified arguments list (so for example, the command above would be executed as `deno run fuzz.ts someseed123`). 
The seed can be any string. 
The resulting problem input for that seed should then be printed to `stdout`.

### Judge

The `[judge]` section in the code block front matter takes the team's submitted solution and determines whether or not it is valid.

```
[judge]
exec = ["deno", "run", "judge.ts"]
```

The command is executed with the seed the same way it is in the [fuzz method](#fuzz) with the same seed for that team. As it is the same seed, it can be used to determine if the submission is valid for that user's puzzle input. 
The team's solution is piped to the command though `stdin`. 
If the command exits with an exit code of `0`, the submitted solution is correct and otherwise it is not. If the question is incorrect, `stderr` will be sent to the client. This is useful for displaying errors regarding incorrect formatting in submissions.

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

## Running a Comp
This section focussed on what you should do once you have your problems and `comp.md` set up.

TODO

### Registering Teams and Users

### Configuring a front-end
Typically you will want to host a user-friendly web client such as fj-svelte.

TODO

### The admin panel

### Recommended Hosting Setups


## Static API
The static API is a simple set of JSON-less, HTML Basic auth based endpoints. For simple clients, this is all you need.

## Live API

Some specific details will need to be gated behind clock or admin authorisations,
whether this should be transparent or specifically noted (e.g. `{ "@gated": "clock" }`) is to be decided.

### Clock

```ts
type Clock = {
  start: Date,
  finish: Date,
  pause?: { hold: Date, release?: Date },
};
```

### Document

* How to lock behind admin or clock functions?

```ts
type Document = {
  title: string,
  icon?: string | URL,
  summary?: string,
  body: string,
};
```

### Problems

```ts
type Problem = {
  slug: string,
  doc: Document,
  points: number,
  group: string,
};
```

### Scoreboard

```ts
type Score = {
  team: Team,
};
```

### Teams

```ts
type Team = {
  name: string,
  org?: string,
  members: User[],
};
```

### Users

```ts
type User = {
  name: string,
};
```

## Maintaining FuzzJudge

TODO
