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
  import { get_comp_info } from "../api";
  import Loading from "./Loading.svelte";

  import SvelteMarkdown from "svelte-markdown";

  let title: string | undefined = undefined;
  let instructions = "";

  get_comp_info().then((data) => {
    title = data.title;
    instructions = data.instructions;
  });
</script>

{#if title === undefined}
  <Loading />
{:else}
  <h1 style="margin-top: -0.2rem;">{title}</h1>
  <SvelteMarkdown source={instructions} />
{/if}
