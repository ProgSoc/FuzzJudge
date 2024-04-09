# ProgSoc FuzzJudge

Randomised input Judging server for ProgComp.

Compiling code on the server machine is tricky, and we can't support everyone's favourite niche languages - so let's make it about transforming the input into the correct output like Advent of Code.

## Background

Previously we've used [DOMjudge](https://www.domjudge.org), but this limited our language support for competing teams who could not exceed various compile, source, memory, file and process limits, and had to use languages that would compile on the host machine.

For ProgComp 2024, we decided to write our own alternative for the competition that takes a different approach - in the style of [Advent of Code](https://adventofcode.com/).
