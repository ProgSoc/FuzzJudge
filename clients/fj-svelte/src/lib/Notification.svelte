<script lang="ts">
  import icons from "../icons";
  import { NOTIFICATION } from "../notifications";
  import Icon from "./Icon.svelte";
  import { onDestroy } from "svelte";

  export let message: string;
  export let close: () => void;

  let opacity = 0;

  setTimeout(() => {
    opacity = 100;
  }, 50);

  let closeTimer = setTimeout(() => {
    close();
  }, 3000);

  let fadeOutTimer = setTimeout(() => {
    opacity = 0;
  }, 2500);

  onDestroy(() => {
    clearTimeout(closeTimer);
    clearTimeout(fadeOutTimer);
  });
</script>

<div class="notification" style={`opacity: ${opacity}%;`}>
  <div>
    {message}
  </div>
  <Icon icon={icons.cross} clickAction={close} />
</div>

<style>
  .notification {
    position: fixed;
    top: 1rem;
    right: 1rem;
    background-color: var(--bg-prim);
    color: var(--text-prim);
    border: 1px solid var(--border);
    padding: 1rem;
    z-index: 1000;
    border-radius: 5px;
    width: 300px;
    display: flex;
    justify-content: space-between;
    transition: opacity 0.3s ease-in-out;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
  }
</style>
