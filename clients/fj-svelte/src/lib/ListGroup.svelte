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
  import type { FuzzJudgeProblemMessage } from "../../../../src/comp";
  import type { QuestionMeta } from "../utils";
  import QuestionButton from "./QuestionButton.svelte";

  export let name: string = "";
  export let questions: Record<string, FuzzJudgeProblemMessage>;
  export let solvedQuestions: Set<string>;
  export let includes: number | ((difficulty: number) => boolean) = 0;

  $: list = Object.values(questions).filter((q) => {
    if (typeof includes === "function") {
      return includes(q.difficulty);
    }

    return q.difficulty === includes;
  });
</script>

{#if list.length > 0}
  <div class="difficulty-divider">{name}</div>
{/if}
{#each list as q}
  <QuestionButton question={q} solved={solvedQuestions.has(q.slug)} />
{/each}

<style>
  .difficulty-divider {
    font-size: 1.2rem;
    margin-left: 0.3rem;
    color: var(--text-sec);
    cursor: pointer;
    padding: 1rem;
    background-color: var(--bg-sec);
    max-width: fit-content;
  }
</style>
