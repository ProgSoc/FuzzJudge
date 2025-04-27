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
  import SvelteMarkdown from "svelte-markdown";
  import Loading from "../Loading.svelte";

  let source: string | undefined = undefined;

  fetch("https://raw.githubusercontent.com/ProgSoc/FuzzJudge/refs/heads/main/docs/MANUAL.md")
    .then((res) => res.text())
    .then((body) => (source = body));
</script>

{#if source !== undefined}
  <div id="instructions-md">
    <SvelteMarkdown {source} />
  </div>
{:else}
  <Loading />
{/if}
