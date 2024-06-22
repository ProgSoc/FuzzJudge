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
  import Loading from "./lib/Loading.svelte";
  import Scoreboard from "./lib/Scoreboard.svelte";
  import { type QuestionMeta } from "./utils";

  import { get_questions, get_comp_info } from "./api";

  let questions: Record<string, QuestionMeta> | undefined = undefined;
  let loading_error: string | undefined = undefined;

  get_comp_info().then((data) => {
    window.document.title = data.title;
  });

  get_questions()
    .then((q) => {
      questions = q;
    })
    .catch((err) => {
      loading_error = err;
    });
</script>

{#if questions !== undefined}
  <Scoreboard {questions} />
{:else if loading_error !== undefined}
  <div class="loading">Error loading questions: {loading_error}</div>
{:else}
  <Loading />
{/if}
