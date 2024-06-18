import { writable, type Writable } from "svelte/store";

export const selected_question: Writable<string> = writable("");

export const BACKEND_SERVER: string = "";
// export const BACKEND_SERVER: string = "http://localhost:8000";

export interface QuestionMeta {
  slug: string;
  num: number;
  name: string;
  icon: string;
  instructions: string;
  solved: boolean;
  points: number;
  difficulty: number;
  brief: string;
}

let n: number = 0;

const get_question_data = async (slug: string) => {
  const data: QuestionMeta = {
    slug,
    num: ++n,
    name: await (
      await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/name`)
    ).text(),
    icon: await (
      await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/icon`)
    ).text(),
    instructions: await (
      await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/instructions`)
    ).text(),
    solved:
      (await (
        await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/solved`)
      ).text()) === "true",
    points: parseInt(
      await (await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/points`)).text(),
    ),
    difficulty: parseInt(
      await (
        await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/difficulty`)
      ).text(),
    ),
    brief: await (
      await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/brief`)
    ).text(),
  };

  data.instructions = data.instructions.replace(
    /(<img\s+[^>]*src=")(?!https:\/\/)([^"]+)"/g,
    (match, p1, p2) => {
      return `${p1}${BACKEND_SERVER}/comp/prob/${slug}/${p2}"`;
    },
  );

  return data;
};

export const difficulty_name = (d: number) => {
  switch (d) {
    case 0:
      return "Tutorial";
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
      return "Hard";
  }
  return "Unknown";
};

export const truncate_username = (username: string) => {
  const MAX_LENGTH = 14;
  return username.length > MAX_LENGTH ? username.slice(0, MAX_LENGTH) + "…" : username;
};

// export let get_questions = async (): Promise<{
//   questions: Record<string, QuestionMeta>,
//   sorted_questions: Record<string, QuestionMeta[]>
// }> => {
//   let questions: Record<string, QuestionMeta> = {};
//   let sorted_questions: Record<string, QuestionMeta[]> = {};
//
//   try {
//     const res = await (await fetch(`${BACKEND_SERVER}/comp/prob/`)).text();
//     let arr = Array.from(
//       res.matchAll(/prob\/(.*)\/"/g),
//       (match) => match[0].split("/")[1],
//     );
//
//     for (const slug of arr) {
//       const q = await get_question_data(slug);
//       let key =
//         q.difficulty > 0 && q.difficulty < 4
//           ? q.difficulty.toString()
//           : "other";
//
//       if (sorted_questions[key] === undefined) {
//         sorted_questions[key] = [];
//       }
//
//       sorted_questions[key]?.push(q);
//
//       questions[slug] = q;
//
//       // if (global.selected_question.get() === undefined) {
//       //   global.change_selected_question(slug);
//       // }
//     };
//   } catch (e: any) {
//     throw e.toString();
//   }
//
//   return { questions, sorted_questions };
// }

export let get_questions = async (): Promise<{
  questions: Record<string, QuestionMeta>;
  sorted_questions: Record<string, QuestionMeta[]>;
}> => {
  let questions = JSON.parse(await (await fetch("questions.json")).text());
  let sorted_questions = JSON.parse(
    await (await fetch("sorted_questions.json")).text(),
  );

  return { questions, sorted_questions };
};

export interface ScoreboardUser {
  name: string;
  points: number;
  solved: string[];
}

export const get_scoreboard = async (): Promise<ScoreboardUser[]> => {
  return [
    { name: "person 1", points: 123, solved: ["chess", "dna"] },
    { name: "person 2", points: 12, solved: ["dehash"] },
    { name: "person 3", points: 1, solved: ["dehash"] },
    { name: "person 4", points: 1234, solved: ["maze", "dna"] },
  ];
};

export interface ScoreboardEvent { }

export const subscribe_to_scoreboard = async (callback: (data: ScoreboardEvent) => void): Promise<(() => void)> => {
  throw "Unable to connect to server for live updates.";
};

export const get_comp_info = async (): Promise<{ title: string, instructions: string }> => {
  // fetch(`${BACKEND_SERVER}/comp/name`)
  //   .then((res) => res.text())
  //   .then((name) => (title = name));
  // fetch(`${BACKEND_SERVER}/comp/instructions`)
  //   .then((res) => res.text())
  //   .then((instructions) => {
  //     html = instructions;
  //   });

  return {
    title: "FuzzJudge Competition",
    instructions: `<p>ProgSoc @ TechFest</p>
<h2 id="runsheet">
    <a class="anchor" aria-hidden="true" tabindex="-1" href="#runsheet">
        <svg class="octicon octicon-link" viewbox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path>
        </svg>
    </a>
    Runsheet
</h2>
<ul>
    <li>11:30 - Event start, teams set up</li>
    <li>12:00 - Competition start</li>
    <li>1:00 - Lunch comes (sandwiches/wraps)</li>
    <li>3:00 - Scoreboard freeze</li>
    <li>4:00 - Competition end, scoreboard unfreeze, announcing winners</li>
</ul>
<h2 id="solving-questions">
    <a class="anchor" aria-hidden="true" tabindex="-1" href="#solving-questions">
        <svg class="octicon octicon-link" viewbox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path>
        </svg>
    </a>
    Solving questions
</h2>
<p>Each question requires processing your generated problem input. Just as an example, here's a simple python program that reads a line from standard input and then prints it out again:</p>
<p>line = input()
print(line)</p>
<p>However, we've created a scaffold for each question that does that for you to make life easier.</p>
<p>We've prepared scaffolds for Python, Java and C++. You should be able to write code locally, test it with the sample inputs/outputs, then upload it to the competition server when you're done to mark it.</p>
<p>To upload a file, make sure you're logged in, then you should have a submit button in the top right. Click, then select your file and the question you're submitting for, and it should judge it from there.</p>
<h2 id="scoring">
    <a class="anchor" aria-hidden="true" tabindex="-1" href="#scoring">
        <svg class="octicon octicon-link" viewbox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path>
        </svg>
    </a>
    Scoring
</h2>
<p>There are 2 points systems:</p>
<pre>
    <code>The team with the most answered questions wins
If there is a tie, the second system is used:

Each time you answer a question, you get "points" for how many minutes passed between the beginning of the competition and when you solved it
Out of the tied teams, the team with the lowest total "points" wins</code>
</pre>
<h2 id="prizes">
    <a class="anchor" aria-hidden="true" tabindex="-1" href="#prizes">
        <svg class="octicon octicon-link" viewbox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path>
        </svg>
    </a>
    Prizes
</h2>
<p>
    1st place: 
    <span class="katex">
        <span class="katex-mathml">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
                <semantics>
                    <mrow>
                        <mn>15002</mn>
                        <mi>n</mi>
                        <mi>d</mi>
                        <mi>p</mi>
                        <mi>l</mi>
                        <mi>a</mi>
                        <mi>c</mi>
                        <mi>e</mi>
                        <mo>:</mo>
                    </mrow>
                    <annotation encoding="application/x-tex">1500 2nd place: </annotation>
                </semantics>
            </math>
        </span>
        <span class="katex-html" aria-hidden="true">
            <span class="base">
                <span class="strut" style="height:0.8889em;vertical-align:-0.1944em"></span>
                <span>15002</span>
                <span class="mathnormal">n</span>
                <span class="mathnormal">d</span>
                <span class="mathnormal" style="margin-right:0.01968em">pl</span>
                <span class="mathnormal">a</span>
                <span class="mathnormal">ce</span>
                <span class="mspace" style="margin-right:0.2778em"></span>
                <span>:</span>
            </span>
        </span>
    </span>
    900 3rd place: $600
</p>
`,
  };
}
