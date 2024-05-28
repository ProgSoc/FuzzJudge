/*
* FuzzJudge - Randomised input judging server, designed for ProgComp.
* Copyright (C) 2024 UTS Programmers' Society (ProgSoc)
*
* This program is free software: you can redistribute it and/or modify it
* under the terms of the GNU Affero General Public License as published
* by the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

/*

Backend

/comp
- /icon
- /name
- /brief
- /instructions
- /prob
  - /:name
    - /icon : utf-8 (emoji, one extended grapheme)
    - /name
    - /brief
    - /instructions
    - /input
    - /judge
/auth
- /login : Get Bearer Token
- /logout : Expire token

*/

import { undent, indent, loadMarkdown } from "./util.ts";
import { FuzzJudgeProblem } from "./comp.ts";
import { pathJoin, walk } from "./deps.ts";
import { Auth } from "./auth.ts";
import { appendAnswer, getScoreboard, getAnswered } from "./score.ts";

if (import.meta.main) {

  const root = await Deno.realPath(Deno.args[0] ?? ".");

  const compfile = loadMarkdown(await Deno.readTextFile(pathJoin(root, "./comp.md")));

  const problems: Record<string, FuzzJudgeProblem> = {};
  for await (const ent of walk(root, {
    includeDirs: false,
    includeSymlinks: false,
    match: [/prob\.md/],
    maxDepth: 2,
  })) {
    try {
      const problem = new FuzzJudgeProblem(ent.path, loadMarkdown(await Deno.readTextFile(ent.path)));
      problems[problem.slug()] = problem;
    } catch (e) {
      console.error(`Could not load "${ent.path}": ${e}`);
    }
  }

  const auth = new Auth({
    basic: ({ username }) => {
      return { username };
    },
  });

  Deno.serve({
    onError: (e) => {
      if (e instanceof Response) return e;
      else return new Response(String(e), { status: 500 });
    }
  }, async req => {
    // FIXME: `http://localhost:8000/auth/` works but `http://localhost:8000/auth` does not
    const url = new URL(req.url);
    switch (url.pathname) {
      case "/auth/": return new Response(undent(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/></head>
        <body>
        <header><h1>Authentication</h1></header>
        <main>
          <ul>
            <li><a href="/auth/login">Login</a></li>
            <li><a href="/auth/logout">Logout</a></li>
          </ul>
        </main>
        </body>
        </html>
      `), { headers: { "Content-Type": "text/html" } });
      case "/auth/login": {
        const details = auth.protect(req);
        return new Response(`Authorized: ${Deno.inspect(details)}\n`);
      }
      case "/auth/logout": {
        return new Response("Logged out.\n", {
          status: 401,
          headers: { "WWW-Authenticate": `Basic charset="utf-8"` },
        });
      }
      case "/comp/": return new Response(undent(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/></head>
        <body>
        <header><h1>Competition</h1></header>
        <main>
          <ul>
            <li><a href="/comp/icon">Icon</a></li>
            <li><a href="/comp/name">Name</a></li>
            <li><a href="/comp/brief">Brief</a></li>
            <li><a href="/comp/instructions">Instructions</a></li>
            <li><a href="/comp/prob/">Problems</a></li>
            <li><a href="/comp/scoreboard">Scoreboard</a></li>
          </ul>
        </main>
        </body>
        </html>
      `), { headers: { "Content-Type": "text/html" } });
      // case "/icon": return new Response();
      case "/comp/name": return new Response(compfile.title ?? "FuzzJudge Competition");
      case "/comp/brief": return new Response(compfile.summary);
      case "/comp/instructions": return new Response(
        compfile.body,
        { headers: { "Content-Type": "text/html" } },
      );
      case "/comp/scoreboard": return new Response(undent(`
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"/></head>
          <body>
          ${getScoreboard(problems).map(user => `<h2>${user.username} - ${user.points}</h2><ul>${user.answers.map(({ slug, time }) => `<li><b>${slug}</b> at ${time}</li>`).join("\n")}</ul>`).join("\n")}
          </body>
          </html>`),
        { headers: { "Content-Type": "text/html" } },
      );
      case "/comp/prob/": {
        return new Response(undent(`
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"/></head>
          <body>
          <header><h1>Problems</h1></header>
          <main>
            <ul>
            ${indent("  ", Object.entries(problems).map(([slug, prob]) => `<li><a href="/comp/prob/${encodeURIComponent(slug)}/">${prob.doc().title ?? slug}</a></li>\n`).join(""))}
            </ul>
          </main>
          </body>
          </html>
        `), { headers: { "Content-Type": "text/html" } });
      }
      default: {
        const pattern = new URLPattern({ pathname: "/comp/prob/{:id/}:fn?" }).exec(url)?.pathname.groups;
        if (pattern !== undefined) {
          const authDetails = auth.protect(req);
          const problem = problems[pattern.id!];
          if (!pattern.fn) {
            return new Response(undent(`
              <!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"/></head>
              <body>
              <header><h1>${problem.doc().title ?? problem.slug()}</h1></header>
              <hr/>
              <main>
                <ul>
                <li><a href="/comp/prob/${pattern.id}/icon">Icon</a></li>
                <li><a href="/comp/prob/${pattern.id}/name">Name</a></li>
                <li><a href="/comp/prob/${pattern.id}/brief">Brief</a></li>
                <li><a href="/comp/prob/${pattern.id}/instructions">Instructions</a></li>
                <li><a href="/comp/prob/${pattern.id}/points">Points</a></li>
                <li><a href="/comp/prob/${pattern.id}/difficulty">Difficulty</a></li>
                <li><a href="/comp/prob/${pattern.id}/points">Fuzz</a></li>
                <li><a href="/comp/prob/${pattern.id}/solved">Solved</a></li>
                <li>
                  <form method="post" action="/comp/prob/${pattern.id}/judge" enctype="text/plain">
                  <fieldset>
                    <legend><a href="/comp/prob/${pattern.id}/judge">Judge</a></legend>
                    <p><textarea name="judge"></textarea></p>
                    <button type="submit">Submit</button>
                  </fieldset>
                  </form>
                </li>
                </ul>
              </main>
              </body>
              </html>
            `), { headers: { "Content-Type": "text/html" } });
          }
          switch (pattern.fn) {
            case "icon": {
              return new Response(problem.doc().icon);
            }
            case "name": {
              return new Response(problem.doc().title ?? problem.slug());
            }
            case "brief": {
              return new Response(problem.doc().summary);
            }
            case "instructions": {
              return new Response(
                problem.doc().body,
                { headers: { "Content-Type": "text/html" } },
              )
            }
            case "fuzz": {
              return new Response(await problem.fuzz(authDetails.username));
            }
            case "judge": {
              if (req.method !== "POST") {
                return new Response("Resource must be POSTed\n", { status: 405, headers: { "Allow": "POST" } });
              }
              let solution = await req.text().then(body => new URLSearchParams(body).get("judge"));
              const { correct, errors } = await problem.judge(authDetails.username, solution);

              if (correct) {
                appendAnswer(authDetails.username, problem.slug());
                return new Response("Success\n", { status: 200 });
              }

              return new Response(`Invalid solution! ${errors}\n`, { status: 400 });
            }
            case "difficulty": {
              return new Response(problem.doc().config?.problem?.difficulty ?? "unknown");
            }
            case "points": {
              return new Response(problem.doc().config?.problem?.points ?? "unknown");
            }
            case "solved": {
              const solved = getAnswered(authDetails.username).some(({ slug }) => slug === problem.slug());
              return new Response(solved ? "true" : "false");
            }
          }

          if (problem.doc().publicAssets?.includes(pattern.fn)) {
            return new Response(await Deno.readFile(pathJoin(root, problem.slug(), pattern.fn)));
          }
        }
        break;
      }
    }
    return new Response("Not Found", { status: 404 });
  });
}
