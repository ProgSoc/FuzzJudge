<script lang="ts">
    import { onDestroy } from "svelte";
    import { get_state_start_time, type CompState, type CompTimes } from "../utils";

  export let comp_times: CompTimes;
  export let until_state: CompState;
  export let show_binary: boolean = true;
  export let show_decimal: boolean = true;

  const start_time = get_state_start_time(comp_times, until_state)

  let time_left_bin = ""
  let time_left_dec = "";

  let anim_frame_ref: number;
  (function update() {
    anim_frame_ref = requestAnimationFrame(update)
    const now = new Date(Date.now());
    const seconds_till: number = Math.floor((start_time.getTime() - now.getTime()) / 1000);

    time_left_bin = seconds_till.toString(2).padStart(10, "0");

    const mins = Math.floor(seconds_till / 60).toString().padStart(2, "0");
    const secs = (seconds_till % 60).toString().padStart(2, "0");
    time_left_dec = `${mins}:${secs}`;
  })();

  onDestroy(() => {
		cancelAnimationFrame(anim_frame_ref);
	});

</script>

<span>
  {#if show_binary}
    {time_left_bin}
  {/if}
  {#if show_decimal}
    {time_left_dec}
  {/if}
</span>

<style>
</style>