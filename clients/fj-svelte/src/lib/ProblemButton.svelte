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
  import type { FuzzJudgeProblemMessage } from "server/services/problems.service";
  import { selectedProblem } from "../utils";

  interface Props {
    problem: FuzzJudgeProblemMessage;
    solved: boolean;
  }

  let { problem, solved }: Props = $props();

  const select = () => {
    selectedProblem.set(problem?.slug ?? "");
  };
</script>

<div
  aria-label={`Select ${problem.doc.title}`}
  role="link"
  tabindex="0"
  onkeyup={select}
  class="option"
  class:selected={$selectedProblem === problem?.slug}
  class:solved={solved}
  onclick={select}
>
  <div class="icon">
    {problem.doc.icon}
  </div>
  <div class="name">
    <span style={solved ? "text-decoration: line-through;" : ""}>{problem.doc.title}</span>
    <br />
    <!-- <span class="subtext">{$q_.brief}</span> -->
    <span class="subtext">{problem.points} points</span>
  </div>
  <div class="status">
    {#if solved}
      ✓
    {/if}
  </div>
</div>

<style>
  .option {
    color: var(--text-sec);
    cursor: pointer;
    padding: 0.3rem;
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-rows: 1fr;
    grid-template-columns: 0.5fr 2.1fr 0.4fr;
    grid-template-rows: 1fr;
    gap: 0px 0px;
    grid-template-areas: "icon name status";
    background-color: var(--bg-sec);
    border: solid 2px transparent;
    border-bottom: solid 1.5px var(--accent);
    transition: all 0.1s ease-in-out;
  }

  .option:hover {
    background-color: var(--bg-prim);
  }

  .solved {
    opacity: 0.6;
    filter: brightness(0.9);
  }

  .icon {
    grid-area: icon;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Noto Emoji", sans-serif;
    transition: all 0.1s;
  }

  .option:hover .icon {
    transform: scale(1.1);
  }

  .name {
    grid-area: name;
  }

  .status {
    grid-area: status;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .subtext {
    opacity: 0.7;
    font-size: 13px;
  }

  .selected {
    background-color: var(--accent) !important;
  }
</style>
