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
  import { openFuzz, submitSolution } from "../api";
  import { selectedQuestion } from "../utils";

  interface Props {
    setSolved: (slug: string) => void;
  }

  let { setSolved }: Props = $props();

  let waitingOnServer = $state(false);

  let errorMessage: string | undefined = $state(undefined);

  let submissionValue = $state("");
  let sourceValue = $state("");

  selectedQuestion.subscribe((_) => {
    submissionValue = "";
    sourceValue = "";
    waitingOnServer = false;
    errorMessage = undefined;
  });

  const submit = (slug: string) => {
    if (waitingOnServer === true) return;

    errorMessage = undefined;

    waitingOnServer = true;

    submitSolution(slug, submissionValue, sourceValue).then(({ correct, message }) => {
      waitingOnServer = false;

      if (slug === $selectedQuestion) {
        errorMessage = message;
      }

      if (correct && setSolved !== undefined) {
        setSolved(slug);
      }
    });
  };
</script>

<div class="question-submission">
  <div class="section">
    <div class="text-area-buttons">
      <span class="get-input">
        To begin, <span
          aria-label="question input"
          role="link"
          tabindex="0"
          onclick={() => openFuzz($selectedQuestion)}
          onkeyup={(e) => {
            if (e.key === "Enter") {
              openFuzz($selectedQuestion);
            }
          }}
          class="input-span"
          >grab your question input!
        </span></span
      >
    </div>
    <div class="section submission-areas">
      <div class="solution-submission">
        <h2>Question Solution</h2>
        <textarea bind:value={submissionValue}></textarea>
      </div>
      <div class="source-submission">
        <h2>Solution source</h2>
        <textarea
          bind:value={sourceValue}
          placeholder="Please include any of the source code used to solve the problem. This may be manually reviewed later."
></textarea>
      </div>
    </div>
    <div class="text-area-buttons">
      <button class="submit" onclick={() => submit($selectedQuestion)}>
        {waitingOnServer ? "Processing..." : "Submit"}
      </button>
    </div>
  </div>
</div>
<div class="error-message-area">
  {#if errorMessage !== undefined}
    <pre class="error-message">
      {errorMessage}
    </pre>
  {/if}
</div>

<style>
  .section {
    flex-direction: column;
    display: flex;
  }

  .error-message-area {
    min-height: 3rem;
  }

  .submit {
    height: 3rem;
    width: 10rem;
    font-size: 1rem;
    font-weight: bold;
    padding-left: 1.4rem;
    padding-right: 1.4rem;
  }

  .get-input {
    margin-bottom: 1rem;
    margin-left: 0.25rem;
  }

  .input-span {
    color: var(--link);
    text-decoration: underline;
    &:hover {
      cursor: pointer;
    }
  }

  .text-area-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%; /* Ensure the container spans the full width */
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
