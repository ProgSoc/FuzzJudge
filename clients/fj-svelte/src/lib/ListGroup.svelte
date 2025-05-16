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
import ProblemButton from "./ProblemButton.svelte";
import { problemOrder } from "../utils";
import type { ProblemsListQueryQuery } from "../gql";
import { createQuery } from "@tanstack/svelte-query";
import { client } from "../gql/sdk";

interface Props {
	name?: string;
	includes?: number | ((difficulty: number) => boolean);
}

let { name = "", includes = 0 }: Props = $props();

const query = createQuery({
	queryKey: ["problemsList"],
	queryFn: () => client.ProblemsListQuery(),
	select: (data) =>
		data.data.problems
			.filter((q) => {
				if (typeof includes === "function") {
					return includes(q.difficulty);
				}

				return q.difficulty === includes;
			})
			.sort(problemOrder),
});
</script>

{#if $query.data}
  <div class="difficulty-divider">{name}</div>
  {#each $query.data as q}
  <ProblemButton problem={q} />
{/each}
{/if}


<style>
  .difficulty-divider {
    font-size: 1.2rem;
    margin-left: 0.3rem;
    color: var(--text-sec);
    cursor: pointer;
    padding: 1rem;
    background-color: var(--bg-sec);
    max-width: fit-content;
    font-weight: bold;
  }
</style>
