<script lang="ts">
  import CompInfo from "./CompInfo.svelte";
  import Popout from "./Popout.svelte";
  import Sidebar from "./Sidebar.svelte";
  import Scoreboard from "./Scoreboard.svelte";
  import SubmissionArea from "./SubmissionArea.svelte";
  import {
    type QuestionMeta,
    selected_question,
    difficulty_name,
  } from "../utils";

  import { get_username } from "../api";

  let username = "Loading...";

  get_username().then((name) => {
    username = name;
  });

  export let questions: Record<string, QuestionMeta> = {};
  export let set_solved: (slug: string) => void;

  selected_question.set(
    Object.values(questions).find((q) => q.num === 1)?.slug ?? "",
  );

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
      <button on:click={() => (showing_popout = ShowingPopout.CompInfo)}
        >Comp Info</button
      >
      <button on:click={() => (showing_popout = ShowingPopout.Scoreboard)}
        >Scoreboard</button
      >
    </div>
    <div>
      Logged in as <b>{username}</b>
      <a href="/auth/logout">Logout</a>
    </div>
  </div>
  <Sidebar {questions} />
  <div
    id="question-instructions"
    class="question-instructions"
    bind:this={question_instructions}
  >
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
          <span style="margin-right: 1rem; opacity:0.7;"
            ><b>Difficulty:</b>
            {difficulty_name(questions[$selected_question].difficulty)}</span
          >
          <span style="opacity:0.7;"
            ><b>Points:</b> {questions[$selected_question].points}</span
          >
        </div>

        <div id="instructions-md">
          {@html questions[$selected_question].instructions}
        </div>
      {/if}

      <SubmissionArea {set_solved} />
    {/if}
  </div>
</div>

<Popout
  shown={showing_popout === ShowingPopout.Scoreboard}
  close={() => (showing_popout = ShowingPopout.None)}
>
  <Scoreboard {questions} />
</Popout>

<Popout
  shown={showing_popout === ShowingPopout.CompInfo}
  close={() => (showing_popout = ShowingPopout.None)}
>
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
    grid-template-columns: min-content 1.7fr;
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

  .question-instructions {
    color: var(--text-prim);
    grid-area: question-instructions;
    overflow-y: scroll;
    padding: 1rem;
    text-wrap: pretty;
  }
</style>
