<script lang="ts">
  import CompInfo from "./CompInfo.svelte";
  import ListGroup from "./ListGroup.svelte";
  import Popout from "./Popout.svelte";
  import Scoreboard from "./Scoreboard.svelte";
  import SubmissionArea from "./SubmissionArea.svelte";
  import {
    type QuestionMeta,
    selected_question,
    difficulty_name,
  } from "../utils";

  let username = "user";

  export let questions: Record<string, QuestionMeta> = {};
  export let sorted_questions: Record<string, QuestionMeta[]> = {};

  enum ShowingPopout {
    None,
    Scoreboard,
    CompInfo,
  }

  let showing_popout: ShowingPopout = ShowingPopout.None;

  let question_instructions: any;

  selected_question.subscribe((slug) => {
    if (slug === undefined) return;

    if (question_instructions !== undefined) {
      question_instructions.scrollTop = 0;
    }
  });
</script>

<div class="layout">
  <div class="top-bar">
    <div>
      <button on:click={() => (showing_popout = ShowingPopout.CompInfo)}>Comp info</button>
      <button on:click={() => (showing_popout = ShowingPopout.Scoreboard)}>Scoreboard</button>
    </div>
    <div>
      Logged in as <b>{username}</b>
      <a href="auth/logout">Logout</a>
    </div>
  </div>
  <div class="question-list">
    <ListGroup name="Easy" list={sorted_questions["1"] ?? []} />
    <ListGroup name="Medium" list={sorted_questions["2"] ?? []} />
    <ListGroup name="Hard" list={sorted_questions["3"] ?? []} />
    <ListGroup name="Other" list={sorted_questions["other"] ?? []} />
  </div>
  <div id="question-instructions" class="question-instructions" bind:this={question_instructions}>
    {#if $selected_question !== undefined}
      {#if questions[$selected_question] !== undefined}
        <h1 style="margin-top: 0px;">
          <span
            style={questions[$selected_question].solved
              ? "text-decoration: line-through;"
              : ""}
          >
            {questions[$selected_question].name}
          </span>

          {#if questions[$selected_question].solved}
            <span style="font-size: 1.3rem;">✓</span>
          {/if}
        </h1>

        <div style="margin-left: 1rem;">
          <span style="margin-right: 1rem;"
            ><b>Difficulty:</b>
            {difficulty_name(questions[$selected_question].difficulty)}</span
          >
          <span><b>Points:</b> {questions[$selected_question].points}</span>
        </div>

        <div id="instructions-md">
          {@html questions[$selected_question].instructions}
        </div>
      {/if}

      <SubmissionArea />
    {/if}
  </div>
</div>

<Popout shown={showing_popout === ShowingPopout.Scoreboard} close={() => (showing_popout = ShowingPopout.None)}>
  <Scoreboard {questions} />
</Popout>

<Popout shown={showing_popout === ShowingPopout.CompInfo} close={() => (showing_popout = ShowingPopout.None)}>
  <CompInfo />
</Popout>

<style>
  .layout {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    display: grid;
    grid-template-columns: 14rem 1.7fr;
    grid-template-rows: 2rem 1.9fr;
    grid-auto-rows: 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      "top-bar top-bar"
      "question-list question-instructions";
  }

  .top-bar {
    grid-area: top-bar;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem;
    color: var(--text-sec);
    background-color: var(--bg-sec);
  }

  .question-list {
    grid-area: question-list;
    color: var(--text-sec);
    background-color: var(--bg-sec);
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .question-instructions {
    color: var(--text-prim);
    background-color: var(--bg-prim);
    grid-area: question-instructions;
    overflow-y: scroll;
    padding: 1.5rem;
  }

  .question-instructions img {
    max-height: 25rem;
    max-width: 90%;
  }
</style>
