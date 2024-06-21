<script lang="ts">
  import { get_comp_info } from "../api";
  import Loading from "./Loading.svelte";

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
  {@html instructions}
{/if}
