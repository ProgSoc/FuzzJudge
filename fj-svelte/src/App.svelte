<script lang="ts">
  import Client from "./lib/Client.svelte";
    import Loading from "./lib/Loading.svelte";
  import Scoreboard from "./lib/Scoreboard.svelte";
  import {
    type QuestionMeta,
    BACKEND_SERVER,
    get_questions,
    selected_question,
  } from "./utils";

  const showing_scoreboard =
    window.location.href.split("/").pop() === "scoreboard";

  let questions: Record<string, QuestionMeta> | undefined = undefined;
  let sorted_questions: Record<string, QuestionMeta[]> | undefined = undefined;
  let loading_error: string | undefined = undefined;

  get_questions()
    .then((data) => {
      questions = data.questions;
      sorted_questions = data.sorted_questions;

      selected_question.set(
        Object.values(questions).find((q) => q.num === 1)?.slug ?? "",
      );

      console.log(questions, sorted_questions);
    })
    .catch((err) => {
      loading_error = err;
    });
</script>

{#if questions !== undefined && sorted_questions !== undefined}
  {#if showing_scoreboard}
    <Scoreboard {questions} />
  {:else}
    <Client {questions} {sorted_questions} />
  {/if}
{:else if loading_error !== undefined}
  <div class="loading">Error loading questions: {loading_error}</div>
{:else}
  <Loading />
{/if}
