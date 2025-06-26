---toml
[fuzz]
exec = ["cargo", "run", "--release", "--", "fuzz"]
env = {}

[judge]
exec = ["cargo", "run", "--release", "--quiet", "--", "judge"]

[problem]
points = 2
difficulty = 1
---

# 🦀 Hello, Ferris!

Example problem implemented in Rust using the [FuzzJudge macro](https://github.com/jaspwr/fuzzjudge-macro).

## Input
```
John
Jane
Ferris
Graydon 
```

## Output
```
Hello, John!
Hello, Jane!
Hello, Ferris!
Hello, Graydon!
```
