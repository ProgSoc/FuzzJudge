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
  import {
    CompState,
    type CompTimes,
    type QuestionMeta,
    selected_question,
    type TimeStateData,
    getCurrentTimeStateData,
    runRepeatedly,
  } from "../utils";
  import { get_questions, get_comp_info, getQuestionSolvedSet } from "../api";
  import { onDestroy, onMount } from "svelte";
  import CompInfo from "./CompInfo.svelte";
  import Popout from "./Popout.svelte";
  import Sidebar from "./Sidebar.svelte";
  import Scoreboard from "./Scoreboard.svelte";
  import QuestionContents from "./QuestionContents.svelte";
  import Loading from "./Loading.svelte";

  import { get_username } from "../api";
  import InlineCountdown from "./counters/InlineCountdown.svelte";
  import PageCountdown from "./counters/PageCountdown.svelte";
  import { initLiveState } from "../apiLive";
  import type { FuzzJudgeProblemMessage } from "../../../../src/comp";
  import type { CompetitionScoreboardMessage } from "../../../../src/score";

  let username = "Loading...";

  get_username().then((name) => {
    username = name;
  });

  let compTimes: CompTimes | undefined = undefined;
  let questions: Record<string, FuzzJudgeProblemMessage> | undefined = undefined;
  let scoreboard: CompetitionScoreboardMessage | undefined = undefined;
  let solvedQuestions = new Set<string>();

  let liveState = initLiveState();
  liveState.listenClock((clock) => {
    compTimes = clock;
  });
  liveState.listenQuestions(async (qs) => {
    questions = Object.fromEntries(qs.map((q) => [q.slug, q]));

    solvedQuestions = await getQuestionSolvedSet(Object.keys(questions));
  });
  liveState.listenScoreboard((sb) => {
    scoreboard = sb;
  });

  get_comp_info().then((data) => {
    window.document.title = data.title;
  });

  let timeStateData: TimeStateData | undefined = undefined;
  runRepeatedly(() => {
    if (compTimes !== undefined) {
      timeStateData = getCurrentTimeStateData(compTimes);
    }
  });

  const setSolved = (slug: string) => {
    solvedQuestions.add(slug);
    solvedQuestions = solvedQuestions;
  };

  enum ShowingPopout {
    None,
    Scoreboard,
    CompInfo,
  }

  let showing_popout: ShowingPopout = ShowingPopout.None;
</script>

<div class="layout">
  <div class="top-bar">
    <div>
      <button on:click={() => (showing_popout = ShowingPopout.CompInfo)}>Comp Info</button>
      <button on:click={() => (showing_popout = ShowingPopout.Scoreboard)}>Scoreboard</button>
      {#if timeStateData !== undefined}
        <InlineCountdown {timeStateData} />
      {/if}
    </div>
    <div>
      Logged in as <b>{username}</b>
      <a href="/void" title="Enter empty credentials">Logout</a>
    </div>
  </div>

  <Sidebar {solvedQuestions} {questions} />

  <!-- main content -->
  {#if timeStateData === undefined}
    <Loading />
  {:else if timeStateData.questionsVisible && $selected_question !== ''}
    {#if questions === undefined}
      <Loading />
    {:else}
      <QuestionContents
        question_data={questions[$selected_question]}
        solved={solvedQuestions.has($selected_question)}
        {setSolved}
      />
    {/if}
  {:else if timeStateData.phase !== CompState.FINISHED}
    <div class="locked-message">
      <PageCountdown {timeStateData} />
    </div>
  {:else}
    <div class="locked-message">
      <div class="finished-message">
        <h1>Competition Finished</h1>
        <p>You can no longer submit solutions.</p>
      </div>
    </div>
  {/if}
</div>

<Popout shown={showing_popout === ShowingPopout.Scoreboard} close={() => (showing_popout = ShowingPopout.None)}>
  {#if questions === undefined || scoreboard === undefined}
    <Loading />
  {:else}
    <Scoreboard {questions} {scoreboard} />
  {/if}
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

  .locked-message {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    font-size: 1.5rem;
    color: var(--text-sec);
  }

  .finished-message {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
