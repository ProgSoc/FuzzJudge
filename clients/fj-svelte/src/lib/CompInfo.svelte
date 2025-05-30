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
import { createQuery } from "@tanstack/svelte-query";
import SvelteMarkdown from "svelte-markdown";
import { client } from "../gql/sdk";
import Loading from "./Loading.svelte";

const instructionsQuery = createQuery({
	queryKey: ["compInfo"],
	queryFn: () => client.CompetitionData(),
	select: ({ data }) => data,
});
</script>

{#if $instructionsQuery.data === undefined}
  <Loading />
{:else}
  <h1 style="margin-top: -0.2rem;">{$instructionsQuery.data.competition.name}</h1>
  <span id="instructions-md">
    <SvelteMarkdown source={$instructionsQuery.data.competition.instructions} />
  </span>
{/if}
