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
  import ListGroup from "./ListGroup.svelte";
  import type { FuzzJudgeProblemMessage } from "server/impl/comp";
  import Icon from "./Icon.svelte";
  import icons from "../icons";

  export let questions: Record<string, FuzzJudgeProblemMessage> = {};
  export let solvedQuestions: Set<string>;
  let open: boolean = true;

  function toggleOpen() {
    open = !open;
  }
</script>

<!-- Navbar markup -->

<!-- Main content -->
{#if open}
  <div class="question-list">
    <div class="list-title-div">
      <h2 class="list-title">Questions</h2>
      <button class="toggle-button" on:click={toggleOpen}>
        {#if open}
          <Icon icon={icons.arrowleft} />
        {:else}
          <Icon icon={icons.arrowright} />
        {/if}
      </button>
    </div>

    <ListGroup name="Easy" {questions} {solvedQuestions} includes={1} />
    <ListGroup name="Medium" {questions} {solvedQuestions} includes={2} />
    <ListGroup name="Hard" {questions} {solvedQuestions} includes={3} />
    <ListGroup name="Other" {questions} {solvedQuestions} includes={(d) => d < 1 || d > 3} />
  </div>
{:else}
  <div class="closed-question-list">
    <button class="toggle-button" on:click={toggleOpen}>
      {#if open}
        <Icon icon={icons.arrowleft} />
      {:else}
        <Icon icon={icons.arrowright} />
      {/if}
    </button>
  </div>
{/if}

<style>
  .toggle-button {
    color: var(--btn-text);
    border: none;
    padding: 0.5rem;
    margin: 1rem;
    cursor: pointer;
    font-weight: bold;
    background-color: var(--accent);
    color: var(--text-sec);
    border: none;
    cursor: pointer;
    border-radius: 0.5rem;
    min-width: max-content;
  }
  .question-list {
    grid-area: question-list;
    color: var(--text-sec);
    background-color: var(--bg-sec);
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .list-title {
    padding-left: 1rem;
    width: 100%;
  }

  @media (width >= 1250px) {
    .question-list {
      min-width: max-content;
      overflow: scroll;
    }
  }

  .closed-question-list {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: var(--bg-sec);
    color: var(--text-sec);
    max-width: fit-content;
  }

  .list-title-div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
  }
</style>
