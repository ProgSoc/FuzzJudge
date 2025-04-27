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
  import { CompState, dateToTimeString, secondsToString, type TimeStateData } from "../../clock";
  import { unreachable } from "../../utils";

  export let timeStateData: TimeStateData;
</script>

{#if timeStateData.phase === CompState.BEFORE}
  <span class="text">
    >Competition starts in <span class="time">{secondsToString(timeStateData.secondsUntilCompetitionStart)}</span></span
  >
{:else if timeStateData.phase === CompState.LIVE_UNFROZEN}
  <span class="text">
    Competition ends in <span class="time">{secondsToString(timeStateData.secondsUntilCompetitionEnd)}</span>. The
    scoreboard will freeze at
    <span class="time">{dateToTimeString(timeStateData.times.hold ?? timeStateData.times.finish)}</span>
  </span>
{:else if timeStateData.phase === CompState.LIVE_FROZEN || timeStateData.phase === CompState.LIVE_UNFROZEN_NO_FREEZE}
  <span class="text">
    Competition ends in <span class="time">{secondsToString(timeStateData.secondsUntilCompetitionEnd)}</span>
  </span>
{:else if timeStateData.phase === CompState.FINISHED}
  <span>Competition finished! You can no longer submit solutions.</span>
{:else}
  {unreachable(timeStateData.phase)}
{/if}

<style>
  .text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .time {
    font-family: monospace;
  }
</style>
