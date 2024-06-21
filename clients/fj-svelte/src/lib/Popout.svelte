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
    <button class="close" on:click={close}>X</button>
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
    background-color: var(--bg-prim);
    color: var(--text-prim);
    box-shadow: 0 0 50px 15px #000;
    max-width: fit-content;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .contents {
    padding: 1rem;
    margin-top: 10px;
  }

  .close{
    text-decoration: double;
    font-weight: bold;
    position: absolute;
    top: 0px;
    right: 10px;
  }
</style>
