<script lang="ts">
  import type { QuestionMeta } from "../utils";
  import QuestionButton from "./QuestionButton.svelte";

  export let name: string = "";
  export let questions: Record<string, QuestionMeta> = {};
  export let includes: number | ((difficulty: number) => boolean) = 0;

  $: list = Object.values(questions)
    .filter((q) => {
      if (typeof includes === "function") {
        return includes(q.difficulty);
      }

      return q.difficulty === includes;
    })
    .sort((a, b) => a.num - b.num);
</script>

{#if list.length > 0}
  <div class="difficulty-divider">{name}</div>
{/if}
{#each list as q}
  <QuestionButton question={q} />
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

