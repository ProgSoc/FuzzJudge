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
  import SubmissionArea from "./SubmissionArea.svelte";
  import {
    type QuestionMeta,
    selected_question,
    difficulty_name,
  } from "../utils";

  export let question_data: QuestionMeta | undefined = undefined;
  export let set_solved: (slug: string) => void;

  let question_instructions: any;

  // Reset scroll to top when a new question is selected
  selected_question.subscribe((slug) => {
    if (slug === undefined) return;

    if (question_instructions !== undefined) {
      question_instructions.scrollTop = 0;
    }
  });
</script>

<div class="question">
  <div
    id="question-instructions"
    class="question-instructions"
    bind:this={question_instructions}
  >
    {#if $selected_question !== undefined}
      {#if question_data !== undefined}
        <h1 style="margin-top: 0px;">
          <span
            style={question_data.solved
              ? "text-decoration: line-through;"
              : ""}
          >
            {question_data.name}
          </span>

          {#if question_data.solved}
            <span style="font-size: 1.3rem;">✓</span>
          {/if}
        </h1>

        <div style="margin-left: 1rem;">
          <span style="margin-right: 1rem; opacity:0.7;"
            ><b>Difficulty:</b>
            {difficulty_name(question_data.difficulty)}</span
          >
          <span style="opacity:0.7;"
            ><b>Points:</b> {question_data.points}</span
          >
        </div>

        <div id="instructions-md">
          {@html question_data.instructions}
        </div>
      {/if}

      <SubmissionArea {set_solved} />
    {/if}
  </div>
</div>

<style>
  .question {
    overflow: scroll;
  }

  .question-instructions {
    color: var(--text-prim);
    grid-area: question-instructions;
    padding: 1rem;
    text-wrap: pretty;
  }
</style>
