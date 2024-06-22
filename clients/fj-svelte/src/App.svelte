<script lang="ts">
  import Client from "./lib/Client.svelte";
  import Loading from "./lib/Loading.svelte";
  import { needs_questions, type CompTimes, type QuestionMeta } from "./utils";

  import { get_questions, get_comp_info, get_comp_times } from "./api";

  let comp_times: CompTimes | undefined = undefined;
  let questions: Record<string, QuestionMeta> | undefined = undefined;
  let loading_error: string | undefined = undefined;

  get_comp_info().then((data) => {
    window.document.title = data.title;
  });

  const load_questions = () => {
    get_questions()
    .then((q) => {
      questions = q;
    })
    .catch((err) => {
      loading_error = err;
    });
  }

  get_comp_times().then(t => {
    comp_times = t
    if(needs_questions(t)) {
      load_questions();
    }
  })
  .catch((err) => {
    loading_error = err
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

{#if comp_times !== undefined && (!needs_questions(comp_times) || questions !== undefined)}
  <Client {questions} {set_solved} {comp_times} />
{:else if loading_error !== undefined}
  <div class="loading">Error loading questions: {loading_error}</div>
{:else}
  <Loading />
{/if}
