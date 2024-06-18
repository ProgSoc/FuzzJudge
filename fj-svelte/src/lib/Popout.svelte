<script>
  export let shown = false;
  export let close = () => {};

  document.addEventListener("keydown", (e) => {
    if (!shown || e.key !== "Escape") return;

    close();
  });
</script>

{#if shown}
  <div class="popout">
    <button class="close" on:click={close}>close</button>
    <div class="contents">
      <slot />
    </div>
  </div>
{/if}

<style>
  .popout {
    position: absolute;
    overflow: scroll;
    width: calc(100% - 60px);
    height: calc(100% - 60px);
    top: 30px;
    left: 30px;
    background-color: var(--bg-prim);
    color: var(--text-prim);
    box-shadow: 0 0 50px 15px #000;
  }

  .contents {
    padding: 1rem;
  }
</style>
