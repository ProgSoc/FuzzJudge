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
  import { copyFuzz, downloadFuzz } from "../api";
  import { selectedProblem } from "../utils";
  import {
    CompState,
    type CompTimes,
    type TimeStateData,
    getCurrentTimeStateData,
    clockTick,
    handleNotifications,
  } from "../clock";
  import CompInfo from "./CompInfo.svelte";
  import Loading from "./Loading.svelte";
  import Popout from "./Popout.svelte";
  import ProblemContents from "./ProblemContents.svelte";
  import Scoreboard from "./Scoreboard.svelte";
  import Sidebar from "./Sidebar.svelte";
  import icons from "../icons";
  import Icon from "./Icon.svelte";
  import InlineCountdown from "./counters/InlineCountdown.svelte";
  import PageCountdown from "./counters/PageCountdown.svelte";
  import Settings from "./Settings.svelte";
  import Manual from "./admin/Manual.svelte";
  import Notification from "./Notification.svelte";
  import { NOTIFICATION } from "../notifications";
  import { client, wsClient } from "../gql/sdk";
  import { ClockSubscriptionDocument, type ClockSubscriptionSubscription } from "../gql";
  import { createQuery } from "@tanstack/svelte-query";
  import { onDestroy, onMount } from "svelte";

  const currentUserQuery = createQuery({
    queryKey: ["username"],
    queryFn: () => client.CurrentUser(),
    select: (data) => data.data.me,
  });

  const competitionName = createQuery({
    queryKey: ["compInfo"],
    queryFn: () => client.CompetitionData(),
    select: (data) => {
      return data.data.competition.name;
    },
  });

  let compTimes = $state<undefined | CompTimes>(undefined);

  let cleanupClock = () => {};

  $effect(() => {
    if ($competitionName.data) {
      window.document.title = `${$competitionName.data}`;
    }
  });

  onMount(() => {
    cleanupClock = wsClient.subscribe<ClockSubscriptionSubscription>(
      {
        query: ClockSubscriptionDocument,
      },
      {
        next: (data) => {
          console.log("ClockSubscription data", data.data?.clock);
          if (data.data?.clock === undefined) return;
          compTimes = data.data.clock;
        },
        error: (err) => {
          console.error("Error in ClockSubscription", err);
        },
        complete: () => {
          console.log("ClockSubscription completed");
        },
      },
    );
  });

  onDestroy(() => {
    cleanupClock();
  });

  let timeStateData = $state<TimeStateData | undefined>(undefined);

  clockTick(() => {
    if (compTimes !== undefined) {
      timeStateData = getCurrentTimeStateData(compTimes);
      handleNotifications(timeStateData);
    }
  });

  type ShowingPopout = "None" | "Scoreboard" | "CompInfo" | "Settings" | "Manual";

  let showingPopout: ShowingPopout = $state("None");

  const keydownHandler = (e: KeyboardEvent) => {
    // if (e.target === document.body && e.key === "ArrowRight") {
    // 	e.preventDefault();
    // 	if (problems === undefined) return;
    // 	const slug = nextUnsolvedProblem(
    // 		problems,
    // 		solvedProblems,
    // 		$selectedProblem,
    // 	);
    // 	if (slug !== null) {
    // 		selectedProblem.set(slug);
    // 	}
    // }

    // if (e.target === document.body && e.key === "ArrowLeft") {
    // 	e.preventDefault();
    // 	if (problems === undefined) return;
    // 	const slug = nextUnsolvedProblem(
    // 		problems,
    // 		solvedProblems,
    // 		$selectedProblem,
    // 		-1,
    // 	);
    // 	if (slug !== null) {
    // 		selectedProblem.set(slug);
    // 	}
    // }

    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();

      if (showingPopout === "Scoreboard") {
        showingPopout = "None";
        return;
      }

      showingPopout = "Scoreboard";
    }

    if (e.ctrlKey && e.key === "m") {
      e.preventDefault();
      showingPopout = "Manual";
    }

    if (e.ctrlKey && e.altKey && e.key === "c") {
      e.preventDefault();
      copyFuzz($selectedProblem);
    }
  };
</script>

<div class="layout">
  <div class="top-bar">
    <div>
      <button onclick={() => (showingPopout = "CompInfo")}>
        <span class="vertical-center">
          <Icon icon={icons.info} /><span class="topbar-button-label"> Comp Info </span>
        </span>
      </button>
      <button onclick={() => (showingPopout = "Scoreboard")}>
        <span class="vertical-center">
          <Icon icon={icons.scoreboard} /><span class="topbar-button-label"> Scoreboard </span>
        </span>
      </button>
    </div>
    <div class="countdown">
      {#if timeStateData !== undefined}
        <InlineCountdown {timeStateData} />
      {/if}
    </div>
    <div class="vertical-center">
      {#if $currentUserQuery.data}
        <span>
          Logged in as <b>{$currentUserQuery.data.logn}</b>
        </span>
      {/if}
      <a href="/void" title="Enter empty credentials">
        <Icon icon={icons.logout} />
      </a>
      <Icon icon={icons.cog} clickAction={() => (showingPopout = "Settings")} />
    </div>
  </div>

  <Sidebar />

  <!-- main content -->
  {#if timeStateData === undefined}
    <Loading />
  {:else if timeStateData.problemsVisible && $selectedProblem !== ""}
    <ProblemContents problemSlug={$selectedProblem} />
  {:else if timeStateData.phase !== CompState.FINISHED}
    <div class="locked-message">
      {#if timeStateData.phase === CompState.BEFORE}
        <div class="lock-icon">
          <Icon icon={icons.locked} />
        </div>
      {/if}
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

<Popout
  shown={showingPopout === "Scoreboard"}
  close={() => (showingPopout = "None")}
  title="Scoreboard"
  icon={icons.scoreboard}
>
  <Scoreboard />
</Popout>

<Popout shown={showingPopout === "CompInfo"} close={() => (showingPopout = "None")}>
  <CompInfo />
</Popout>

<Popout shown={showingPopout === "Manual"} close={() => (showingPopout = "None")}>
  <Manual />
</Popout>

<Popout shown={showingPopout === "Settings"} close={() => (showingPopout = "None")} title="Settings" icon={icons.cog}>
  <Settings />
</Popout>

{#if $NOTIFICATION !== undefined}
  <Notification message={$NOTIFICATION} close={() => NOTIFICATION.set(undefined)} />
{/if}

<svelte:window onkeydown={keydownHandler} />

<style>
  .layout {
    height: 100%;
    width: 100%;
    position: absolute;
    background-color: var(--bg-prim);
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
      "problem-list problem-instructions";
  }

  .vertical-center {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.3em;
  }

  .top-bar {
    grid-area: top-bar;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem;
    color: var(--text-sec);
    background-color: var(--bg-sec);
    border-bottom: 1px solid var(--border);
  }

  .locked-message {
    display: flex;
    flex-direction: column;
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

  .lock-icon {
    opacity: 0.4;
    margin-bottom: 0.2rem;
  }

  @media (width < 600px) {
    .countdown {
      visibility: hidden;
      width: 0px;
    }
  }

  .topbar-button-label {
    margin-left: 5px;
  }

  @media (width < 600px) {
    .topbar-button-label {
      height: 14px;
      visibility: hidden;
      width: 0px;
      margin-left: 0px;
      padding: 0px;
    }
  }
</style>
