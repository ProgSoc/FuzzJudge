<!--
This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Lesser General Public License as published by the
Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
for more details.

You should have received a copy of the GNU Lesser General Public License along
with this program. If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
  import { problemOrder, truncateUsername } from "../utils";

  import type { CompetitionScoreboardMessage } from "server/v1/score";
  import type { FuzzJudgeProblemMessage } from "server/services/problems.service";

  interface Props {
    problems: Record<string, FuzzJudgeProblemMessage>;
    scoreboard: CompetitionScoreboardMessage;
  }

  let { problems, scoreboard }: Props = $props();

  const errors: string[] = [];

  // Hack for the day
  // 2025-04-27 edit: hack forever
  let filteredTeams = $derived(scoreboard.filter((team) => team.name !== "Admin"));

  let sortedProblems = $derived(Object.values(problems).sort(problemOrder));
</script>

<table>
  <thead>
    <tr>
      <th> Position </th>
      <th> Team </th>
      <th> Points </th>
      {#each sortedProblems as problem}
        <th class="problem-num">{problem.doc.icon}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each filteredTeams as team, i}
      <tr>
        <td class="position">
          {i + 1}
        </td>
        <td class="team-name">
          {truncateUsername(team.name)}
        </td>
        <td class="points">
          {team.score.total.points}
        </td>
        {#each sortedProblems as problem}
          <td class={`result`} class:solved={team.score.problems[problem.slug]?.solved}>
            {#if team.score.problems[problem.slug]?.solved}
              ✓
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

{#if errors.length > 0}
  <div>
    {#each errors as error}
      <code>{error}</code>
    {/each}
  </div>
{/if}

<style>
  table {
    border-collapse: collapse;
    margin: 1rem;
  }

  .team-name {
    padding-left: 1rem;
    padding-right: 1rem;
    font-weight: bold;
  }

  .problem-num {
    min-width: 1.5rem;
  }

  .solved {
    background-color: var(--solved);
    color: var(--bg-sec);
    text-align: center;
  }

  th {
    padding: 0.8rem 0.3rem;
    border: solid 1px var(--text-prim);
  }

  td {
    padding: 0.3rem;
    border: solid 1px var(--text-sec);
  }

  .result {
    align-items: center;
  }

  tr {
    background-color: var(--bg-main);
  }

  tr:nth-child(even) {
    background-color: var(--bg-sec);
  }
</style>
