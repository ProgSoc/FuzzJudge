# ProgSoc FuzzJudge

Randomised input judging server, designed for ProgComp.

Compiling code on the server machine is tricky, and we can't support everyone's favourite niche languages - so let's make it about transforming the input into the correct output like Advent of Code.

> Please refer to [the user manual](https://github.com/progsoc/fuzzjudge/tree/main/tfjm) for details on running a competition and the API.

## Debugging the Project

```sh
$ cd server/
$ bun run dev
```

## Competition Format

- Competition Folder (Demo in `sample/`)
  - `comp.md` Competition description and config (code block front matter)
  - `<prob>/` Problem Folders
    - `prob.md` Problem description and config (code block front matter). [See below](#problem-format).

## Backend API

- `/auth`
  - `login`
  - `logout`
- `/comp`
  - `name`
  - `brief`
  - `instructions`
  - `scoreboard`
  - `prob/:id`
    - `icon`
    - `name`
    - `brief`
    - `difficulty`
    - `points`
    - `fuzz`
    - `judge`
    - `assets/**`

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
