---toml
[server]
public = [ "client" ]

[times]
start = 2025-06-03T11:04:57.837Z
finish = 2025-06-03T11:12:57.837Z
isReleased = true
freeze = 5
---

# ProgComp 2023

ProgSoc @ TechFest

## Runsheet

- 11:30 - Event start, teams set up
- 12:00 - Competition start
- 1:00 - Lunch comes (sandwiches/wraps)
- 3:00 - Scoreboard freeze
- 4:00 - Competition end, scoreboard unfreeze, announcing winners

## Solving questions

Each question requires processing your generated problem input. Just as an example, here's a simple python program that reads a line from standard input and then prints it out again:

line = input()
print(line)

However, we've created a scaffold for each question that does that for you to make life easier.

We've prepared scaffolds for Python, Java and C++. You should be able to write code locally, test it with the sample inputs/outputs, then upload it to the competition server when you're done to mark it.

To upload a file, make sure you're logged in, then you should have a submit button in the top right. Click, then select your file and the question you're submitting for, and it should judge it from there.

## Scoring

There are 2 points systems:

    The team with the most answered questions wins
    If there is a tie, the second system is used:

    Each time you answer a question, you get "points" for how many minutes passed between the beginning of the competition and when you solved it
    Out of the tied teams, the team with the lowest total "points" wins

## Prizes

1st place: $1500 2nd place: $900 3rd place: $600
