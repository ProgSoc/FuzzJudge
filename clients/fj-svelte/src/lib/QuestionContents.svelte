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
import { onDestroy } from "svelte";
import SvelteMarkdown from "svelte-markdown";
import { difficultyName, removeMdTitle, selectedQuestion } from "../utils";
import SubmissionArea from "./SubmissionArea.svelte";
import type { FuzzJudgeProblemMessage } from "server/services/problems.service";

export let question: FuzzJudgeProblemMessage;
export let solved: boolean;
export let setSolved: (slug: string) => void;

// biome-ignore lint/style/useConst: svelte
let questionInstructions: HTMLDivElement | undefined = undefined;

// Reset scroll to top when a new question is selected
const unsubScrollUp = selectedQuestion.subscribe((slug) => {
	if (slug === undefined) return;

	if (questionInstructions !== undefined) {
		questionInstructions.scrollTop = 0;
	}
});

onDestroy(() => {
	unsubScrollUp();
});
</script>

<div class="question" bind:this={questionInstructions}>
  <div id="question-instructions" class="question-instructions">
    {#if $selectedQuestion !== undefined}
      {#if question !== undefined}
        <h1 style="margin-top: 0px;">
          <span style={solved ? "text-decoration: line-through;" : ""}>
            {question.doc.title}
          </span>

          {#if solved}
            <span style="font-size: 1.3rem;">✓</span>
          {/if}
        </h1>

        <div style="margin-left: 1rem;">
          <span style="margin-right: 1rem; opacity:0.7;"
            ><b>Difficulty:</b>
            {difficultyName(question.difficulty)}</span
          >
          <span style="opacity:0.7;"><b>Points:</b> {question.points}</span>
        </div>

        <div id="instructions-md">
          <SvelteMarkdown source={removeMdTitle(question.doc.body)} />
        </div>
      {/if}

      <SubmissionArea {setSolved} />
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
