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
  import { CompState, dateToTimeString, secondsToBinary, secondsToString, type TimeStateData } from "../../clock";
  import { unreachable } from "../../utils";

  interface Props {
    timeStateData: TimeStateData;
  }

  let { timeStateData }: Props = $props();
</script>

<div class="countdown">
  <!-- svelte-ignore block_empty -->
  {#if timeStateData.phase === CompState.BEFORE}
    <div class="small">Competition starts in...</div>
    <div class="time">
      {secondsToString(timeStateData.secondsUntilCompetitionStart)}
    </div>
    <div class="small subtitle binary">{secondsToBinary(timeStateData.secondsUntilCompetitionStart)}</div>
  {:else if timeStateData.phase === CompState.LIVE_UNFROZEN}
    <div class="small">Competition ends in...</div>
    <div class="time">
      {secondsToString(timeStateData.secondsUntilCompetitionEnd)}
    </div>
    <div class="small subtitle">
      The scoreboard will freeze at {dateToTimeString(timeStateData.times.hold ?? timeStateData.times.finish)}
    </div>
  {:else if timeStateData.phase === CompState.LIVE_FROZEN || timeStateData.phase === CompState.LIVE_UNFROZEN_NO_FREEZE}
    <div class="small">Competition ends in...</div>
    <div class="time">
      {secondsToString(timeStateData.secondsUntilCompetitionEnd)}
    </div>
  {:else if timeStateData.phase === CompState.FINISHED}
    <span>Competition finished! You can no longer submit solutions.</span>
  {:else}
    {unreachable(timeStateData.phase)}
  {/if}
</div>

<style>
  .countdown {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    gap: 0.5rem;
    color: var(--text-sec);
  }

  .time {
    font-family: monospace;
  }

  .small {
    font-size: 1rem;
  }

  .subtitle {
    opacity: 0.7;
    font-style: italic;
  }

  .binary {
    font-family: monospace;
  }
</style>
