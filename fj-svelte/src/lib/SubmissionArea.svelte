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
    <div class="text-area-buttons">
      <span class="get-input" > To begin, <span class="input-span" on:click={open_fuzz}>grab your question input! </span></span>
      </div>
    <textarea bind:value={submission_value} />
    <div class="text-area-buttons">
 
    <button on:click={() => submit($selected_question)}>
      {waiting_on_server ? "Processing..." : "Submit"}
    </button>
    </div>

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
    flex: 1; /* Make each button take up equal space */
    width: 50%; /* Ensure each button takes up half the container's width */
    box-sizing: border-box;
    &:hover {
      background-color: #121212;
    } /* Include padding and border in the element's total width and height */
  }

  .get-input{
    margin-bottom: 1rem;
    margin-left: 0.25rem;
  }

  .input-span{
    color: green;
    &:hover{
      color:lightgreen;
      cursor:pointer;
    }
  }

  .text-area-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%; /* Ensure the container spans the full width */
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
    justify-content: start;
    flex-direction: column;
    align-content: start;
    flex-wrap: wrap;
    align-items: center;
  }
</style>
