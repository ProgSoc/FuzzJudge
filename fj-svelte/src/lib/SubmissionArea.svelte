<script lang="ts">
  import { writable } from "svelte/store";
  import { selected_question, BACKEND_SERVER } from "../utils";

  const open_fuzz = () => {
    window.open(
      `${BACKEND_SERVER}/comp/prob/${$selected_question}/fuzz`,
      "_blank",
    );
  };

  let waiting_on_server = false;

  let error_message = writable("");

  let submission_value = "";

  const submit = (slug: string) => {
    if (waiting_on_server === true) return;

    error_message.set("");

    waiting_on_server = true;

    fetch(`${BACKEND_SERVER}comp/prob/${slug}/judge`, {
      method: "POST",
      body: `judge=${submission_value}`,
    }).then((res) => {
      waiting_on_server = false;

      res.text().then((body) => {
        if (slug !== $selected_question) return;

        error_message.set(body);
      });

      if (res.ok) {
        // global.get_question_data(slug).then(q => q.solved?.set(() => true));
      }
    });
  };
</script>

<div class="question-submission">
  <div class="section">
    <button class="get-input" on:click={open_fuzz}> Get input </button>
  </div>
  <div class="section">
    <textarea bind:value={submission_value} />
    <button on:click={() => submit($selected_question)}>
      {waiting_on_server ? "Processing..." : "Submit"}
    </button>
  </div>
  <div class="sec error-message-area">
    {#if $error_message !== undefined}
      <code class="error-message">
        {$error_message}
      </code>
    {/if}
  </div>
</div>

<style>
  .get-input {
    padding: 1.7rem;
  }

  .section {
    flex-direction: column;
    display: flex;
  }

  .error-message-area {
    min-height: 3rem;
  }

  button {
    color: var(--text-sec);
    background-color: var(--bg-sec);
    margin: 0.25rem;
  }

  textarea {
    height: 8rem;
    width: 15rem;
    color: var(--text-sec);
    background-color: var(--bg-sec);
    margin: 0.25rem;
  }

  .question-submission {
    color: var(--text-prim);
    background-color: var(--bg-prim);
    grid-area: question-submission;
    padding: 0.7rem;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-content: center;
    flex-wrap: wrap;
    align-items: center;
  }
</style>
