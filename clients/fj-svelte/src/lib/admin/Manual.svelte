<script lang="ts">
  import SvelteMarkdown from "svelte-markdown";
  import Loading from "../Loading.svelte";

  let source: string | undefined = undefined;

  fetch("https://raw.githubusercontent.com/ProgSoc/FuzzJudge/refs/heads/main/docs/MANUAL.md")
    .then((res) => res.text())
    .then((body) => (source = body));
</script>

{#if source !== undefined}
  <div id="instructions-md">
    <SvelteMarkdown {source} />
  </div>
{:else}
  <Loading />
{/if}
