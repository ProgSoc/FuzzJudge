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
  import { type Icon } from "../types";

  export let icon: Icon;

  const styles: any = {
    width: icon.width,
  };

  if (icon.height !== undefined) {
    styles.height = icon.height;
  }

  const css = Object.entries(styles)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
</script>

<span class:darken-on-hover={icon.darkenOnHover === true}>
  <img src={icon.dataUri} alt={icon.alt} style={css} aria-label={icon.ariaLabel} />
</span>

<style>
  .darken-on-hover:hover {
    filter: brightness(0.6);
  }

  img {
    display: block;
    -webkit-user-drag: none;
    user-select: none;
  }
</style>
