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
  import { createQuery } from "@tanstack/svelte-query";
  import { onDestroy } from "svelte";
  import SvelteMarkdown from "svelte-markdown";
  import { derived } from "svelte/store";
  import { client } from "../gql/sdk";
  import { difficultyName, removeMdTitle, selectedProblem } from "../utils";
  import SubmissionArea from "./SubmissionArea.svelte";
  import { problemQueryOption } from "../api";

  let problemInstructions: HTMLDivElement | undefined = $state(undefined);

  // Reset scroll to top when a new problem is selected
  const unsubScrollUp = selectedProblem.subscribe((slug) => {
    if (slug === undefined) return;

    if (problemInstructions !== undefined) {
      problemInstructions.scrollTop = 0;
    }
  });

  onDestroy(() => {
    unsubScrollUp();
  });
  /**
   * Solved
   * Name
   * Difficulty
   * Points
   * Body
   */
  const problemData = createQuery(
    derived(selectedProblem, ($selectedProblem) =>
      problemQueryOption($selectedProblem),
    ),
  );
</script>

<div class="problem" bind:this={problemInstructions}>
  <div id="problem-instructions" class="problem-instructions">
    {#if $selectedProblem !== undefined}
      {#if $problemData.data}
        <h1 style="margin-top: 0px;">
          <span
            style={$problemData.data.solved
              ? "text-decoration: line-through;"
              : ""}
          >
            {$problemData.data.name}
          </span>

          {#if $problemData.data.solved}
            <span style="font-size: 1.3rem;">✓</span>
          {/if}
        </h1>

        <div class="stats">
          <span style="margin-right: 1rem;"
            ><b>Difficulty:</b>
            {difficultyName($problemData.data.difficulty)}</span
          >
          <span><b>Points:</b> {$problemData.data.points}</span>
        </div>

        <div id="instructions-md">
          {#if $problemData.data.instructions}
            <SvelteMarkdown
              source={removeMdTitle($problemData.data.instructions)}
            />
          {/if}
        </div>
      {/if}

      <SubmissionArea />
    {/if}
  </div>
</div>

<style>
  .problem {
    overflow: scroll;
    padding-left: 0.7rem;
    padding-top: 0.5rem;
    background-color: var(--bg-prim);
  }

  .problem-instructions {
    color: var(--text-prim);
    grid-area: problem-instructions;
    padding: 1rem;
    text-wrap: pretty;
  }

  .stats {
    opacity: 0.7;
    background-color: var(--accent);
    padding: 0.5rem;
    margin-top: -0.3rem;
  }
</style>
