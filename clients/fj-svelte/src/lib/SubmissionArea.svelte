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

export let setSolved: (slug: string) => void;

let waitingOnServer = false;

let errorMessage: string | undefined = undefined;

let submissionValue = "";
let sourceValue = "";

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

	submitSolution(slug, submissionValue, sourceValue).then(
		({ correct, message }) => {
			waitingOnServer = false;

			if (slug === $selectedQuestion) {
				errorMessage = message;
			}

			if (correct && setSolved !== undefined) {
				setSolved(slug);
			}
		},
	);
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
          on:click={() => openFuzz($selectedQuestion)}
          on:keyup={(e) => {
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
        <textarea bind:value={submissionValue} />
      </div>
      <div class="source-submission">
        <h2>Solution source</h2>
        <p>Please include any of the source code used to solve the problem. This may be manually reviewed later.</p>
        <textarea bind:value={sourceValue} />
      </div>
    </div>
    <div class="text-area-buttons">
      <button class="submit" on:click={() => submit($selectedQuestion)}>
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

  .source-submission {
    max-width: 20rem;
  }

  .submit {
    height: 3rem;
    width: 10rem;
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
    color: var(--accent-text);
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
