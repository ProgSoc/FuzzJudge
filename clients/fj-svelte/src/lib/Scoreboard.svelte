<script lang="ts">
  import { onMount } from "svelte";
  import {
    type QuestionMeta,
    truncate_username,
    type ScoreboardUser,
  } from "../utils";

  import {
    get_scoreboard,
    subscribe_to_scoreboard,
    type ScoreboardEvent,
  } from "../api";

  export let questions: Record<string, QuestionMeta> = {};

  let users: ScoreboardUser[] = [];
  let errors: string[] = [];

  get_scoreboard()
    .then((res) => {
      users = res;
    })
    .catch((err) => {
      errors.push(err.toString());
      errors = errors;
    });

  let unsubscribe: (() => void) | null = null;

  subscribe_to_scoreboard((event: ScoreboardEvent) => {
    if (event.new_scoreboard !== undefined) {
      users = event.new_scoreboard;
    }
  })
    .then((unsub) => {
      unsubscribe = unsub;
    })
    .catch((err) => {
      errors.push(err.toString());
      errors = errors;
    });

  $: users = users.sort((a, b) => b.points - a.points);
  $: sorted_questions = Object.values(questions).sort((a, b) => a.num - b.num);

  onMount(() => {
    return () => {
      if (unsubscribe !== null) {
        unsubscribe();
      }
    };
  });
</script>

<h1>Scoreboard</h1>
<table>
  <tr>
    <th> Position </th>
    <th> Team </th>
    <th> Points </th>
    {#each sorted_questions as question}
      <th class="question-num">{question.num}</th>
    {/each}
  </tr>
  {#each users as user, i}
    <tr>
      <td class="position">
        {i + 1}
      </td>
      <td class="team-name">
        {truncate_username(user.name)}
      </td>
      <td class="points">
        {user.points}
      </td>
      {#each sorted_questions as question}
        <td
          class={`result ${user.solved.includes(question.slug) ? "solved" : ""}`}
        >
          {#if user.solved.includes(question.slug)}
            ✓
          {/if}
        </td>
      {/each}
    </tr>
  {/each}
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
