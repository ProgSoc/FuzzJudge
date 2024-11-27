# FuzzJudge the Specification (DRAFT)

## Data Model

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
