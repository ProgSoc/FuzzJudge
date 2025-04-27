<script lang="ts">
  import { SETTINGS } from "../settings";
  import { Theme } from "../themes/themes";
    import { currentYear } from "../utils";

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

<footer>
  <span>
  &copy; 2024-{currentYear()} ProgSoc. fj-svelte is provided under an LGPv3 licence.
  </span>
  <a href="https://github.com/ProgSoc/FuzzJudge/tree/main/clients/fj-svelte">
    fj-svelte source
  </a>
  <a href="https://github.com/ProgSoc/FuzzJudge/">
    FuzzJudge source
  </a>
</footer>

<style>
  footer {
    position: absolute;
    bottom: 10px;
    font-size: 14px;
    color: var(--text-sec);
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc(100% - 70px);
  }
</style>
