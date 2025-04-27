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

A problem can be implemented in any programming language as long as it supports stdin, stdout, command-line arguments and return codes. Each team is assigned a seed which is given to the problem's generator (fuzz method) by the server. 
When the team then submits their solution, the problem's validator (judge method) is then given the submitted solution and the same seed that was used to generate that teams input. 
This way the only state that needs to be stored on the server is the team's seed! With the same seed, the same problem input can be regenerated and solved on the server to be compared with the submitted solution.

In addition to being agnostic to the language the problems are implemented in, the server has no one primary front-end and is designed such that competitors can connect however they want and building a custom client is straightforward.
The server has both a [static, JSON-less, HTML Basic Auth based API](#static-api) enabling super simple clients such as a CLI in languages and environments where JSON parsing and complex auth is non-trivial, and a [live WebSocket API](#live-api) for complex web clients that can receive scoreboard events and other live updates.

Problems and competition metadata is specified in code blocks within markdown files. 

## Competition Structure
> For full examples, see [the sample competition](https://github.com/ProgSoc/FuzzJudge/tree/main/sample).

All information for a competition including the problems is stored in a competition directory. A competition directory must contain a markdown document named `comp.md`. The following is an example of a `prob.md` file.

```md
---toml
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
### Times
The `[times]` section contains the start and finish times of the competition. 
* `start` is when the problem instructions become avalible and solutions can start being submitted.
* `finish` is when solutions can no longer be submitted.
* `freeze` is the number of seconds before the `finish` where the scoreboard stops being updated. This is used to create suspense and uncertainy around who has won until it is announced.

### Competition Info
The remainer of the document should specifiy other details about the event relevant to competators. This is avalible on an endpoint and some clients may choose to display it.

## Problem Structure
> For full examples, see [the sample competition](https://github.com/ProgSoc/FuzzJudge/tree/main/sample).

Problems are stored in directories in the competition directory.
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


### The Admin Panel
TODO

### Registering Teams and Users

### Configuring a front-end
Typically you will want to host a user-friendly web client such as fj-svelte.

TODO

### Recommended Hosting Setups


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

- 200 List of all problems slugs seperated by commas `text/csv`



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
