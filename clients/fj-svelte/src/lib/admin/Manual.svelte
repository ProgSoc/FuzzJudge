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
  import { createQuery } from "@tanstack/svelte-query";

  const manualQuery = createQuery({
    queryKey: ["manual"],
    queryFn: () =>
      fetch("https://raw.githubusercontent.com/ProgSoc/FuzzJudge/refs/heads/main/docs/MANUAL.md")
        .then((res) => res.text())
        .catch((err) => {
          console.error("Error fetching manual", err);
          return "Error fetching manual";
        }),
  });
</script>

{#if $manualQuery.data}
  <div id="instructions-md">
    <SvelteMarkdown source={$manualQuery.data} />
  </div>
{:else}
  <Loading />
{/if}
