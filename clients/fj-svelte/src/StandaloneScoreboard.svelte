<script lang="ts">
  import Loading from "./lib/Loading.svelte";
  import Scoreboard from "./lib/Scoreboard.svelte";
  import { type QuestionMeta } from "./utils";

  import { get_questions, get_comp_info } from "./api";

  let questions: Record<string, QuestionMeta> | undefined = undefined;
  let loading_error: string | undefined = undefined;

  get_comp_info().then((data) => {
    window.document.title = data.title;
  });

  get_questions()
    .then((q) => {
      questions = q;
    })
    .catch((err) => {
      loading_error = err;
    });
</script>

{#if questions !== undefined}
  <Scoreboard {questions} />
{:else if loading_error !== undefined}
  <div class="loading">Error loading questions: {loading_error}</div>
{:else}
  <Loading />
{/if}
