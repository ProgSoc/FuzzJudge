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
import {
	createQuery,
	experimental_streamedQuery,
} from "@tanstack/svelte-query";
import { onDestroy, onMount } from "svelte";
import { writable } from "svelte/store";
import {
	ScoreboardSubscriptionDocument,
	type ScoreboardSubscriptionSubscription,
} from "../gql";
import { client, wsClient } from "../gql/sdk";
import { problemOrder, truncateUsername } from "../utils";

const errors: string[] = [];

const scoreboardRows = writable<
	ScoreboardSubscriptionSubscription["scoreboard"]
>([]);

let scoreboardcleanup = () => {};

onMount(() => {
	scoreboardcleanup = wsClient.subscribe<ScoreboardSubscriptionSubscription>(
		{
			query: ScoreboardSubscriptionDocument,
		},
		{
			next: (data) => {
				console.log("ScoreboardSubscription data", data.data?.scoreboard);
				if (data.data?.scoreboard === undefined) return;
				scoreboardRows.set(data.data.scoreboard);
			},
			error: (err) => {
				console.error("Error in ScoreboardSubscription", err);
			},
			complete: () => {
				console.log("ScoreboardSubscription completed");
			},
		},
	);
});

onDestroy(() => {
	scoreboardcleanup();
});

const query = createQuery({
	queryKey: ["problemsList"],
	queryFn: () => client.ProblemsListQuery(),
	select: (data) => data.data.problems,
});
</script>

{#if $scoreboardRows}
  <table>
    <thead>
      <tr>
        <th> Position </th>
        <th> Team </th>
        <th> Points </th>
        {#if $query.data}
          {#each $query.data as problem}
            <th class="problem-num">{problem.icon}</th>
          {/each}
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each $scoreboardRows as row}
        <tr>
          <td class="position">
            {row.rank}
          </td>
          <td class="team-name">
            {truncateUsername(row.team.name)}
          </td>
          <td class="points">
            {row.points}
          </td>
          {#if $query.data}
            {#each row.problems as problem}
              <td class={`result`} class:solved={problem.solved}>
                {#if problem.solved}
                  ✓
                {/if}
              </td>
            {/each}
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

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
