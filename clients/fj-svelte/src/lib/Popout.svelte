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
import icons from "../icons";
import Icon from "./Icon.svelte";

// biome-ignore lint/style/useConst: is assigned as a prop
export let shown = false;
export let close = () => {};

let maximized = false;
const onMaximiseToggle = () => {
	maximized = !maximized;
};

document.addEventListener("keydown", (e) => {
	if (!shown || e.key !== "Escape") return;

	close();
});
</script>

{#if shown}
  <div class="content-centered" class:popout={!maximized} class:popout-fullscreen={maximized}>
    <button class="close" on:click={close}>
      <Icon icon={icons.cross} />
    </button>
    <button class="maximise" on:click={onMaximiseToggle}>
      {#if maximized}
        <Icon icon={icons.minimise} />
      {:else}
        <Icon icon={icons.maximise} />
      {/if}
    </button>
    <div class="contents">
      <slot />
    </div>
  </div>
{/if}

<style>
  .content-centered {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .popout {
    position: absolute;
    overflow: auto;
    width: calc(100% - 60px);
    height: calc(100% - 60px);
    background-color: var(--bg-prim);
    color: var(--text-prim);
    box-shadow: 0 0 50px 15px #000;
    max-width: fit-content;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 50vw;
  }

  .popout-fullscreen {
    position: fixed;
    overflow: auto;
    width: 100vw;
    height: 100vh;
    background-color: var(--bg-prim);
    color: var(--text-prim);
    box-shadow: 0 0 50px 15px #000;
    inset: 0px;
  }

  .contents {
    padding: 1rem;
    margin-top: 10px;
  }

  .close {
    text-decoration: double;
    font-weight: bold;
    position: absolute;
    top: 0px;
    right: 10px;
  }

  .maximise {
    text-decoration: double;
    font-weight: bold;
    position: absolute;
    top: 0px;
    right: 30px;
  }
</style>
