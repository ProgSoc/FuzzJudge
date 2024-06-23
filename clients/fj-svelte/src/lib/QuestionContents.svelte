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
  import { type QuestionMeta, selected_question, difficulty_name } from "../utils";
  import { onDestroy } from "svelte";
  import type { FuzzJudgeProblemMessage } from "../../../../src/comp";
  import SvelteMarkdown from "svelte-markdown";

  export let question_data: FuzzJudgeProblemMessage | undefined;
  export let solved: boolean;
  export let setSolved: (slug: string) => void;

  let question_instructions: any;

  // Reset scroll to top when a new question is selected
  const unsub_scroll_up = selected_question.subscribe((slug) => {
    if (slug === undefined) return;

    if (question_instructions !== undefined) {
      question_instructions.scrollTop = 0;
    }
  });

  onDestroy(() => {
    unsub_scroll_up();
  });
</script>

<div class="question" bind:this={question_instructions}>
  <div id="question-instructions" class="question-instructions">
    {#if $selected_question !== undefined}
      {#if question_data !== undefined}
        <h1 style="margin-top: 0px;">
          <span style={solved ? "text-decoration: line-through;" : ""}>
            {question_data.doc.title}
          </span>

          {#if solved}
            <span style="font-size: 1.3rem;">✓</span>
          {/if}
        </h1>

        <div style="margin-left: 1rem;">
          <span style="margin-right: 1rem; opacity:0.7;"
            ><b>Difficulty:</b>
            {difficulty_name(question_data.difficulty)}</span
          >
          <span style="opacity:0.7;"><b>Points:</b> {question_data.points}</span>
        </div>

        <div id="instructions-md">
          <SvelteMarkdown source={question_data.doc.body} />
        </div>
      {/if}

      {#if $selected_question !== undefined}
        <SubmissionArea {setSolved} />
      {/if}
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
