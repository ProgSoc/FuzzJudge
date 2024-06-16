# ProgSoc FuzzJudge

Randomised input judging server, designed for ProgComp.

Compiling code on the server machine is tricky, and we can't support everyone's favourite niche languages - so let's make it about transforming the input into the correct output like Advent of Code.

## Debugging the Project

```sh
$ deno run --watch -A src/main.ts sample/
```

## Competition Format

- `/comp` Competition Folder
    - `/comp/comp.md` Competition description and config (code block front matter)
    - `/comp/style.css` Frontend competition page stylesheet
    - `/comp/<prob>/` Problem Folders
      - `/comp/<prob>/prob.md` Problem description and config (code block front matter). [See below](#problem-format).

## Backend API Listing

- `/comp/`
- `/auth/`

## Problem Format
A problem directory should contain a markdown document `prob.md` and any other required files. For an full examples see [the sample questions](https://github.com/ProgSoc/FuzzJudge/tree/main/sample).

### Fuzz
The `[fuzz]` section in the code block front matter is used to generate a user's unique problem input based on that user's unique seed.
```
[fuzz]
exec = ["deno", "run", "fuzz.ts"]
env = { KEY = 123 }
```
* `cmd` is the command to be run to generate the problem input.
* `env` is any any environment variables to set for the command.

The command is executed in the path of the problem directory with the seed appended to the end of the specified arguments list (so for example the command above would be executed as `deno run fuzz.ts someseed123`). The seed can be any string. The resulting problem input for that seed should then be sent to `stdout`.

### Judge
The `[judge]` section in the code block front matter takes the user's solution to the problem and determines whether or not it is correct.
```
[judge]
exec = ["deno", "run", "judge.ts"]
```
The command is executed with the seed the same way it is in the (fuzz method)[#fuzz] with the same seed for that user. As it is the same seed, it can be used to determine if the submission is valid for that user's puzzle input. The user's puzzle input is piped to the command though `stdin`. If the command exits with an exit code of `0`, the submitted solution is correct and otherwise it is not. If the question is incorrect, `stderr` will be sent to the client. This is useful for displaying errors regarding incorrect formatting in submissions.

### Problem Metadata
* **Title**: The first large header (e.g. `# FuzzJudge Problem`) in the document specifies the problem title.
* **Icon**: Any emoji (unicode RGI emoji) in the first large header specifies the problem's icon (e.g. `# 😄 FuzzJudge Problem`). This will be excluded from the problem title.
* **Brief**: The first paragraph in the document specifies a brief for the question.
* **Instructions**: The remainder of the document (including the brief) is the instructions for the problem. Any images included in the problem directory can be used in the document with the regular image syntax `![Some image](image.png)` and they will automatically be made public.


The `[problem]` section in the code block front matter is used to specify the difficulty and points.
```
[problem]
points = 20
difficulty = 3
```
* `points` is the number of points awarded for submitting a passing solution.
* `difficult` is a difficulty rating where 1 is easy, 2 is medium and 3 is hard.

## Background

Previously we've used [DOMjudge](https://www.domjudge.org), but this limited our language support for competing teams who could not exceed various compile, source, memory, file and process limits, and had to use languages that would compile on the host machine.

For ProgComp 2024, we decided to write our own alternative for the competition that takes a different approach - in the style of [Advent of Code](https://adventofcode.com/).

## License

Available under the [GNU AGPLv3](./LICENSE.md)

```
FuzzJudge - Randomised input judging server, designed for ProgComp.
Copyright (C) 2024 UTS Programmers' Society (ProgSoc)

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
```
