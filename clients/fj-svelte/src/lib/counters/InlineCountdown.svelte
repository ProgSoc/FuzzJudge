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
  import { CompState, unreachable, type TimeStateData, type CompTimes } from "../../utils";
  import { dateToTimeString, secondsToString } from "./shared";

  export let timeStateData: TimeStateData;
</script>

{#if timeStateData.phase === CompState.BEFORE}
  <span>Competition starts in {secondsToString(timeStateData.secondsUntilCompetitionStart)}</span>
{:else if timeStateData.phase === CompState.LIVE_UNFROZEN}
  <span>
    Competition ends in {secondsToString(timeStateData.secondsUntilCompetitionEnd)}. The scoreboard will freeze at {dateToTimeString(
      timeStateData.times.hold ?? timeStateData.times.finish,
    )}
  </span>
{:else if timeStateData.phase === CompState.LIVE_FROZEN || timeStateData.phase === CompState.LIVE_UNFROZEN_NO_FREEZE}
  <span>
    Competition ends in {secondsToString(timeStateData.secondsUntilCompetitionEnd)}.
  </span>
{:else if timeStateData.phase === CompState.FINISHED}
  <span>Competition finished! You can no longer submit solutions.</span>
{:else}
  {unreachable(timeStateData.phase)}
{/if}

<style>
</style>
