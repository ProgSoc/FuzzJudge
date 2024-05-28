```toml
# FuzzJudge - Randomised input judging server, designed for ProgComp.
# Copyright (C) 2024 UTS Programmers' Society (ProgSoc)
#
# This program is free software: you can redistribute it and/or modify it
# under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

[fuzz]
exec = ["deno", "run", "fuzz.ts"]
env = {}

[judge]
exec = ["deno", "run", "judge.ts"]

[problem]
points = 20
difficulty = 3
```

# 👋 Hello Programmers!

Say hello to your fellow programmers!

In this problem we'll be greeting people.

For example, `Linus` will be converted to `Hello Linus!`.

Make sure you have a look at the "scaffolds" page, to see how get familiar with how the questions will do I/O.

## Input format

The first line contains a string `S` which is the name to be greeted.

S is at least one character long, and contains only letters.

## Output format

Output the greeting to the name.
