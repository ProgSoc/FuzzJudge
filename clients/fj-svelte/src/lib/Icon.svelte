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
  import type { IconDescriptor } from "../types";

  interface Props {
    icon: IconDescriptor;
    clickAction?: (() => void) | undefined;
    overrideWidth?: string | undefined;
  }

  let { icon, clickAction = undefined, overrideWidth = undefined }: Props = $props();

  const width = overrideWidth ?? icon.width ?? "1.5rem";

  const styles = {
    width: width,
    height: icon.height ?? width,
    mask: `url(${icon.dataUri}) no-repeat center`,
  };

  const css = Object.entries(styles)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
</script>

<span class:darken-on-hover={icon.darkenOnHover === true || clickAction !== undefined}>
  {#if !clickAction}
    <div style={css} aria-label={icon.ariaLabel}></div>
  {:else}
    <button onclick={clickAction} style={css} aria-label={icon.ariaLabel}></button>
  {/if}
</span>

<style>
  .darken-on-hover:hover {
    filter: brightness(0.6);
  }

  div,
  button {
    display: block;
    background-color: var(--text-prim);
  }
</style>
