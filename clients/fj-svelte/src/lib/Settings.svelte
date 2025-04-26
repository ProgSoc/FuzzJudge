<script lang="ts">
  import { SETTINGS, Theme } from "../settings";

  let theme = $SETTINGS.theme ?? Theme.Default;

  $: SETTINGS.update((settings) => {
    settings.theme = theme;
    return settings;
  });
</script>

<h3>Theme</h3>
<select bind:value={theme}>
  {#each Object.values(Theme) as themeOption}
    <option value={themeOption}>{themeOption}</option>
  {/each}
</select>
