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
import { onDestroy, onMount } from "svelte";
import {
	type QuestionMeta,
	type ScoreboardUser,
	truncateUsername,
} from "../utils";

import type { FuzzJudgeProblemMessage } from "server/impl/comp";
import type { CompetitionScoreboardMessage } from "server/impl/score";

export let questions: Record<string, FuzzJudgeProblemMessage>;
export let scoreboard: CompetitionScoreboardMessage;

const errors: string[] = [];

// Hack for the day
$: filteredTeams = scoreboard.filter((team) => team.name !== "Admin");

$: sortedQuestions = Object.values(questions).sort(
	(a, b) => a.points - b.points,
);
</script>

<h1>Scoreboard</h1>
<table>
  <thead>
  <tr>
    <th> Position </th>
    <th> Team </th>
    <th> Points </th>
    {#each sortedQuestions as question}
      <th class="question-num">{question.doc.icon}</th>
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
      {#each sortedQuestions as question}
        <td class={`result`} class:solved={team.score.problems[question.slug]?.solved}>
          {#if team.score.problems[question.slug]?.solved}
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

  .question-num {
    min-width: 1.5rem;
  }

  .solved {
    background-color: #41df56;
    color: #000000;
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
