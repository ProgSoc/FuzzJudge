<script lang="ts">
  import Client from "./lib/Client.svelte";
  import Loading from "./lib/Loading.svelte";
  import {
    CompState,
    get_current_comp_state,
    get_time_till_next_state,
    needs_questions,
    type CompTimes,
    type QuestionMeta,
  } from "./utils";
  import { get_questions, get_comp_info, get_comp_times } from "./api";
  import { onDestroy } from "svelte";

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
  };

  let current_state: CompState | undefined = undefined;
  let timer_ref = -1;
  // Sets a timer to trigger a rerender to update the main content
  const set_timer_for_next_state = () => {
    if (comp_times == undefined) return;
    current_state = get_current_comp_state(comp_times);
    if (needs_questions(comp_times)) {
      load_questions();
    }
    console.log(`changed current state to ${current_state}`);

    timer_ref = setTimeout(
      () => {
        set_timer_for_next_state();
      },
      get_time_till_next_state(comp_times, current_state),
    );
  };
  onDestroy(() => clearTimeout(timer_ref));

  get_comp_times()
    .then((t) => {
      if (t === undefined) {
        load_questions();
        return;
      }

      console.log("got times");
      comp_times = t;
      if (needs_questions(t)) {
        load_questions();
      }
      set_timer_for_next_state();
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

{#if ((comp_times !== undefined && !needs_questions(comp_times)) || questions !== undefined)}
  <Client {questions} {set_solved} {comp_times} {current_state} />
{:else if loading_error !== undefined}
  <div class="loading">Error loading questions: {loading_error}</div>
{:else}
  <Loading />
{/if}
