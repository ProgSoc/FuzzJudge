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
  import Client from "./lib/Client.svelte";

  // For hot reloading
  try {
    const socket = new WebSocket(`ws://localhost:25566`);

    socket.addEventListener("message", (event) => {
      window.location.reload();
    });
  } catch (e) {
    console.error("Failed to connect to hot-reloading socket: ", e);
  }
</script>

<Client />
