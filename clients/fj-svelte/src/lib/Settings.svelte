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
import { run } from "svelte/legacy";

import { SETTINGS } from "../settings";
import { Theme } from "../themes/themes";
import { currentYear } from "../utils";

let theme = $state($SETTINGS.theme ?? Theme.Default);

run(() => {
	SETTINGS.update((settings) => {
		settings.theme = theme;
		return settings;
	});
});
</script>


<h3>Theme</h3>
<select bind:value={theme}>
  {#each Object.values(Theme) as themeOption}
    <option value={themeOption}>{themeOption}</option>
  {/each}
</select>

<footer>
  <span>
    &copy; 2024-{currentYear()} UTS ProgSoc. fj-svelte is provided under an LGPv3 licence.
  </span>
  <a href="https://github.com/ProgSoc/FuzzJudge/tree/main/clients/fj-svelte"> fj-svelte source </a>
  <a href="https://github.com/ProgSoc/FuzzJudge/"> FuzzJudge source </a>
</footer>

<style>
  footer {
    position: absolute;
    bottom: 10px;
    font-size: 14px;
    color: var(--text-sec);
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc(100% - 70px);
  }
</style>
