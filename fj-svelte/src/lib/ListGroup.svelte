<script lang="ts">
  import type { QuestionMeta } from "../utils";
  import QuestionButton from "./QuestionButton.svelte";

  export let name: string = "";
  export let list: QuestionMeta[] = [];
</script>

{#if list.length > 0}
  <div class="diff-divider">{name}</div>
{/if}
{#each list as q}
  <QuestionButton question={q} />
{/each}

<style>
  .diff-divider {
    font-size: 1.2rem;
    margin-left: 0.3rem;
    color: var(--text-sec);
    cursor: pointer;
    padding: 1rem;
    background-color: var(--bg-sec);
    max-width: fit-content;
  }
</style>
