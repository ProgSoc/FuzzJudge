# TF(J)M (The FuzzJudge Manual)
This is a guide intended for future ProgSoc executives or anyone who wants to host a programming competition with FuzzJudge. The document walks you though all of the necessary steps for creating and running a competition, creating custom FuzzJudge clients and maintaining this codebase.

## Contents
1. [Design Overview](#design-overview)
1. [Competition Structure](#competition-structure)
1. [Problem Structure](#problem-structure)
1. [Running a Comp](#running-a-comp)
1. [Scoring System](#scoring-system)
1. [Static API](#static-api)
1. [Live API](#live-api)
1. [Maintaining FuzzJudge](#maintaining-fuzzjudge)

## Design Overview
The FuzzJudge server serves problem descriptions and randomised inputs, validates problem solutions, tracks each team's score and runs a timer for competition start and finish times.

A problem can be implemented in any programming language as long as it supports `stdin`, `stdout`, command-line arguments and return codes. Each team is assigned a seed which is given to the problem's generator ([fuzz method](#fuzz)) by the server. 
When the team then submits their solution, the problem's validator ([judge method](#judge)) is then given the submitted solution and the same seed that was used to generate that team's input. 
This way the only state that needs to be stored on the server is the team's seed! With the same seed, the same problem input can be regenerated and solved on the server to be compared with the submitted solution.

In addition to being agnostic to the language the problems are implemented in, the server has no one primary front-end and is designed such that competitors can connect however they want and building a custom client is straightforward.
The server has both a [static, JSON-less, HTML Basic Auth based API](#static-api) enabling super simple clients such as a CLI in languages and environments where JSON parsing and complex auth is non-trivial, and a [live WebSocket API](#live-api) for complex web clients that can receive scoreboard events and other live updates.

Problems and competition metadata is specified in code blocks within markdown files. 

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

## Running a Comp
This section focussed on what you should do once you have your problems and `comp.md` set up.

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

## Scoring System
Each problem is [worth a certain amount of points](#problem-metadata) and when a team solves that problem they are awarded that number of points.
Teams are first sorted by their points but if there is a tie the teams with the least penalty points is placed ahead. When the team solves a problem, they receive $t + 20f$ penalty points where $t$ is the number of minuets between the start of the competition and the moment the solution is accepted and $f$ is the number of previous failed attempts at that problem.

## Static API
The static API is a simple set of mostly JSON-less, HTML Basic auth based endpoints. For simple clients, this is all you need.


> Version 0.1.0

### Path Table

| Method | Path | Description |
| --- | --- | --- |
| GET | [/comp/prob](#getcompprob) |  |
| GET | [/comp/prob/{id}/icon](#getcompprobidicon) |  |
| GET | [/comp/prob/{id}/name](#getcompprobidname) |  |
| GET | [/comp/prob/{id}/brief](#getcompprobidbrief) |  |
| GET | [/comp/prob/{id}/difficulty](#getcompprobiddifficulty) |  |
| GET | [/comp/prob/{id}/points](#getcompprobidpoints) |  |
| GET | [/comp/prob/{id}/solution](#getcompprobidsolution) |  |
| GET | [/comp/prob/{id}/instructions](#getcompprobidinstructions) |  |
| GET | [/comp/prob/{id}/fuzz](#getcompprobidfuzz) |  |
| GET | [/comp/prob/{id}/judge](#getcompprobidjudge) |  |
| POST | [/comp/prob/{id}/judge](#postcompprobidjudge) |  |
| GET | [/comp/prob/{id}/assets/*](#getcompprobidassets) |  |
| GET | [/comp/meta](#getcompmeta) |  |
| GET | [/comp/submissions](#getcompsubmissions) |  |
| GET | [/comp/submission](#getcompsubmission) |  |
| GET | [/comp/name](#getcompname) |  |
| GET | [/comp/brief](#getcompbrief) |  |
| GET | [/comp/instructions](#getcompinstructions) |  |
| GET | [/comp/scoreboard](#getcompscoreboard) |  |
| GET | [/comp/clock](#getcompclock) |  |
| PATCH | [/comp/clock](#patchcompclock) |  |
| GET | [/user](#getuser) |  |
| POST | [/user](#postuser) |  |
| PATCH | [/user/{id}](#patchuserid) |  |
| DELETE | [/user/{id}](#deleteuserid) |  |
| GET | [/team](#getteam) |  |
| POST | [/team](#postteam) |  |
| PATCH | [/team/{id}](#patchteamid) |  |
| DELETE | [/team/{id}](#deleteteamid) |  |
| GET | [/](#get) |  |
| BREW | [/](#brew) |  |
| GET | [/ws](#getws) |  |
| GET | [/auth](#getauth) |  |
| GET | [/admin](#getadmin) |  |
| GET | [/mark](#getmark) |  |
| GET | [/void](#getvoid) |  |

### Reference Table

| Name | Path | Description |
| --- | --- | --- |
| Basic | [#/components/securitySchemes/Basic](#componentssecurityschemesbasic) |  |

### Path Details

***

### [GET]/comp/prob

#### Responses

- 200 List of all problems slugs separated by commas `text/csv`



***

### [GET]/comp/prob/{id}/icon

#### Responses

- 200 Icon of the problem (emoji) `text/plain`



- 404 Problem not found

***

### [GET]/comp/prob/{id}/name

#### Responses

- 200 Name of the problem `text/plain`



- 404 Problem not found

***

### [GET]/comp/prob/{id}/brief

#### Responses

- 200 Brief description of the problem `text/plain`



- 404 Problem not found

***

### [GET]/comp/prob/{id}/difficulty

#### Responses

- 200 Difficulty of the problem `text/plain`



- 404 Problem not found

***

### [GET]/comp/prob/{id}/points

#### Responses

- 200 Points of the problem `text/plain`



- 404 Problem not found

***

### [GET]/comp/prob/{id}/solution

#### Responses

- 451 Unavailable for legal reasons `text/plain`



***

### [GET]/comp/prob/{id}/instructions

- Security  
Basic  

#### Responses

- 200 Instructions of the problem `text/markdown`



- 401 Unauthorized `text/plain`



- 404 Problem not found

***

### [GET]/comp/prob/{id}/fuzz

- Security  
Basic  

#### Responses

- 200 Fuzzed input for the problem `text/plain`



- 401 Unauthorized `text/plain`



- 403 User not in a team `text/plain`



- 404 Problem not found

***

### [GET]/comp/prob/{id}/judge

- Security  
Basic  

#### Responses

- 200 Judgement of the problem `text/plain`



- 401 Unauthorized `text/plain`



- 403 User not in a team `text/plain`



- 404 Problem not found

***

### [POST]/comp/prob/{id}/judge

- Security  
Basic  

#### RequestBody

- application/x-www-form-urlencoded

```ts
{
  output: string
  source: string
}
```

#### Responses

- 200 Judgement of the problem `text/plain`



- 400 Bad Request `text/plain`



- 401 Unauthorized `text/plain`



- 403 User not in a team `text/plain`



- 404 Problem not found

- 409 Problem already solved `text/plain`



- 415 Unsupported Media Type (Expected application/x-www-form-urlencoded) `text/plain`



- 422 Unprocessable Content (Invalid submission) `text/plain`



***

### [GET]/comp/prob/{id}/assets/*

- Security  
Basic  

#### Responses

- 200 Assets of the problem

- 404 Problem not found

***

### [GET]/comp/meta

- Security  
Bearer  

#### Responses

- 200 Meta data `application/json`



- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [GET]/comp/submissions

- Security  
Bearer  

#### Parameters(Query)

```ts
team: number
```

```ts
slug: string
```

#### Responses

- 200 Submission skeletons `application/json`

```ts
{
  id: number
  team: number
  prob: string
  time: string
  ok: boolean
}[]
```

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [GET]/comp/submission

- Security  
Bearer  

#### Parameters(Query)

```ts
kind: enum[out, code, vler]
```

```ts
subm: number
```

#### Responses

- 200 submission output `text/plain`



- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



- 404 Data not found

***

### [GET]/comp/name

#### Responses

- 200 Competition name `text/plain`



***

### [GET]/comp/brief

#### Responses

- 200 Competition brief `text/plain`



***

### [GET]/comp/instructions

#### Responses

- 200 The problem instructions `text/html`



***

### [GET]/comp/scoreboard

#### Responses

- 200 scoreboard csv `text/csv`



***

### [GET]/comp/clock

#### Responses

- 101 Websocket upgrade

- 500 Upgrade failed

***

### [PATCH]/comp/clock

- Security  
Bearer  

#### RequestBody

- application/x-www-form-urlencoded

```ts
{
  kind: enum[start, finish]
  time: string
  keep?: boolean
}
```

#### Responses

- 204 Success

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [GET]/user

- Security  
Bearer  

#### Responses

- 200 All users `application/json`

```ts
{
  id: number
  team: number
  name: string
  logn: string
  role: enum[admin, competitor]
}[]
```

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [POST]/user

- Security  
Bearer  

#### RequestBody

- application/x-www-form-urlencoded

```ts
{
  logn: string
  role: enum[admin, competitor]
}
```

#### Responses

- 201 Successfully created user `application/json`

```ts
{
  id: number
  team: number
  name: string
  logn: string
  role: enum[admin, competitor]
}
```

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [PATCH]/user/{id}

- Security  
Bearer  

#### RequestBody

- application/x-www-form-urlencoded

```ts
{
  logn?: string
  role?: enum[admin, competitor]
}
```

#### Responses

- 204 User updated

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [DELETE]/user/{id}

- Security  
Bearer  

#### Responses

- 204 User deleted

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [GET]/team

- Security  
Bearer  

#### Responses

- 200 All teams `application/json`

```ts
{
  id: number
  name: string
  seed: string
}[]
```

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [POST]/team

- Security  
Bearer  

#### RequestBody

- application/x-www-form-urlencoded

```ts
{
  name: string
}
```

#### Responses

- 201 Created team `application/json`

```ts
{
  id: number
  name: string
  seed: string
}
```

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [PATCH]/team/{id}

- Security  
Bearer  

#### RequestBody

- application/x-www-form-urlencoded

```ts
{
  name: string
}
```

#### Responses

- 204 Created team

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [DELETE]/team/{id}

- Security  
Bearer  

#### Responses

- 204 Deleted team

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



***

### [GET]/

#### Responses

- 200 FuzzJudge API `text/plain`



***

### [BREW]/

#### Responses

- 418 I'm a teapot

***

### [GET]/ws

#### Responses

- 101 WebSocket connection

***

### [GET]/auth

- Security  
Basic  

#### Responses

- 200 Auth `text/plain`



- 401 Unauthorized `text/plain`



***

### [GET]/admin

- Security  
Basic  

#### Responses

- 200 Admin `text/html`



- 401 Unauthorized `text/plain`



***

### [GET]/mark

- Security  
Basic  

#### Parameters(Query)

```ts
id: number
```

```ts
ok: boolean
```

#### Responses

- 204 OK

***

### [GET]/void

- Security  
Basic  

#### Responses

- 204 OK

- 401 Unauthorized `text/plain`



- 403 Forbidden `text/plain`



### References

#### #/components/securitySchemes/Basic

```ts
{
  "type": "http",
  "scheme": "basic"
}
```


## Live API

> Version 1.0.0

The live API allows complex clients to receive real-time updates from the server via a websocket.
A Client can open a connection via a GET request to the [/ws](#getws) endpoint.
The live API handles three types of events: problem updates, scoreboard updates and clock updates.
Any of these events may be sent out at any time to enable things such as delays and problem hot-fixes.

### Scoreboard Updates
The scoreboard API allows clients to have live scoreboards. These messages are resent when any team scores points.

```ts
export type CompetitionScoreboardMessage = {
	rank: number;
	name: string;
	score: TeamScore;
}[];

export type TeamScore = {
	total: { points: number; penalty: number };
	problems: Record<string, ProblemScore>;
};

export type ProblemScore = {
	points: number;
	penalty: number;
	tries: number;
	solved: boolean;
};
```

### Clock Updates
Clock updates contain the start, and finish times defined in [comp.md](#competition-structure). These are resent if the event times are edited from the [admin panel](#the-admin-panel).

```ts
export type CompetitionClockMessage = {
	start: Date;
	finish: Date;
	hold: Date | null;
};

export type ClockState = "live" | "hold" | "stop";
```

### Problem Updates

```ts
type Problem = {
  slug: string,
  doc: Document,
  points: number,
  group: string,
};
```

```ts
type Document = {
  title: string,
  icon?: string | URL,
  summary?: string,
  body: string,
};
```

## Maintaining FuzzJudge
### Repository Structure
TODO
### API versioning
TODO
### Design Philosophy
TODO
