<!--
This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Lesser General Public License as published by the
Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
for more details.

You should have received a copy of the GNU Lesser General Public License along
with this program. If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
  import { writable } from "svelte/store";
  import { selected_question } from "../utils";
  import { submit_solution, open_fuzz } from "../api";

  export let set_solved: (slug: string) => void;

  let waiting_on_server = false;

  let error_message = writable("");

  let submission_value = "";
  let source_value = "";

  selected_question.subscribe((_) => {
    submission_value = "";
    source_value = "";
  });

  const submit = (slug: string) => {
    if (waiting_on_server === true) return;

    error_message.set("");

    waiting_on_server = true;

    submit_solution(slug, submission_value, source_value).then(({ correct, message }) => {
      waiting_on_server = false;

      if (slug === $selected_question) {
        error_message.set(message);
      }

      if (correct && set_solved !== undefined) {
        set_solved(slug);
      }
    });
  };
</script>

<div class="question-submission">
  <div class="section">
    <div class="text-area-buttons">
      <span class="get-input">
        To begin, <span class="input-span" on:click={() => open_fuzz($selected_question)}
          >grab your question input!
        </span></span
      >
    </div>
    <div class="section submission-areas">
      <div class="solution-submission">
        <h2>Question Solution</h2>
        <textarea bind:value={submission_value} />
      </div>
      <div class="source-submission">
        <h2>Solution source</h2>
        <p>Please include any of the source code used to solve the problem. This may be manually reviewed later.</p>
        <textarea bind:value={source_value} />
      </div>
    </div>
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

  .get-input {
    margin-bottom: 1rem;
    margin-left: 0.25rem;
  }

  .input-span {
    color: green;
    &:hover {
      color: lightgreen;
      cursor: pointer;
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
