import { score, solvedSet } from "./submission.service";
import { allTeams } from "./team.service";

/** @deprecated */
export async function oldScoreboard(): Promise<string> {
  let out = "username, points, solved\n";
  for (const { id: team, name } of await allTeams()) {
    const solved = [...(await solvedSet({ team }))].join(", ");
    out += `${name}, ${score({ team })}${solved ? ", " + solved : ""}\n`;
  }
  return out;
}
