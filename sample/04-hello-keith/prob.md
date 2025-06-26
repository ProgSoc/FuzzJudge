---toml
[fuzz]
exec = ["run", "fuzz"]
env = {}

[judge]
exec = ["run", "judge"]

[problem]
points = 2
difficulty = 1
---

# 🐀 Hello, Keith!

Example problem implemented in C++. If you implement a problem in C or C++, it is important that you 
diff the code before recompiling to not hog server resources. This can be achieved with a makefile.

## Input
```
Bjarne
Keith
Alice
Bob
Eve
```

## Output
```
Hello, Bjarne!
Hello, Keith!
Hello, Alice!
Hello, Bob!
Hello, Eve!
```
