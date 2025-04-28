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
  import icons from "../icons";
  import Icon from "./Icon.svelte";
  import ListGroup from "./ListGroup.svelte";

  interface Props {
    problems?: Record<string, FuzzJudgeProblemMessage>;
    solvedProblems: Set<string>;
  }

  let { problems = {}, solvedProblems }: Props = $props();
  let open = $state(true);

  function toggleOpen() {
    open = !open;
  }

  const keydownHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "p") {
      e.preventDefault();
      open = !open;
    }
  };
</script>

<div class="problem-list" class:closed={!open}>
  {#if open}
    <div class="list-title-div">
      <h2 class="list-title">Problems</h2>
      <Icon icon={icons.arrowleft} clickAction={toggleOpen} />
    </div>

    <ListGroup name="Easy" {problems} {solvedProblems} includes={1} />
    <ListGroup name="Medium" {problems} {solvedProblems} includes={2} />
    <ListGroup name="Hard" {problems} {solvedProblems} includes={3} />
    <ListGroup name="Other" {problems} {solvedProblems} includes={(d) => d < 1 || d > 3} />
  {:else}
    <Icon icon={icons.arrowright} clickAction={toggleOpen} />
  {/if}
</div>

<svelte:window onkeydown={keydownHandler} />

<style>
  .problem-list {
    grid-area: problem-list;
    color: var(--text-prim);
    background-color: var(--bg-sec);
    overflow-y: scroll;
    overflow-x: hidden;
    min-width: 16rem;
    border-right: 1px solid var(--border);
  }

  .list-title {
    padding-left: 1rem;
  }

  .closed {
    min-width: 2.5rem !important;
    width: 2.5rem !important;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .list-title-div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    margin-left: 0.5rem;
    margin-right: 1rem;
  }
</style>
