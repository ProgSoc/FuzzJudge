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
import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
import Client from "./lib/Client.svelte";
import { SETTINGS } from "./settings";
import { Theme, themeClass } from "./themes/themes";

const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
<div id="theme-container" class={themeClass($SETTINGS.theme ?? Theme.Default)}>
  <Client />
</div>
  <SvelteQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
