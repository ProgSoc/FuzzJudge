<script lang="ts">
  import Client from "./lib/Client.svelte";
  import Loading from "./lib/Loading.svelte";
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

  const set_solved = (slug: string) => {
    if (questions === undefined) return;

    questions[slug].solved = true;
  };

  try {
    const socket = new WebSocket(`ws://localhost:25566`);

    socket.addEventListener("message", (event) => {
      window.location.reload();
    });
  } catch (e) {
    console.error("Failed to connect to socket: ", e);
  }
</script>

{#if questions !== undefined}
  <Client {questions} {set_solved} />
{:else if loading_error !== undefined}
  <div class="loading">Error loading questions: {loading_error}</div>
{:else}
  <Loading />
{/if}
