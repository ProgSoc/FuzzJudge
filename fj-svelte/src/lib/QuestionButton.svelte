<script lang="ts">
  import { type QuestionMeta, selected_question } from "../utils";

  export let question: QuestionMeta | undefined = undefined;

  const select = () => {
    selected_question.set(question?.slug ?? "");
  };
</script>

{#if question !== undefined}
  <div
    class={`option ${$selected_question === question?.slug ? "selected" : ""}`}
    on:click={select}
  >
    <div class="icon">
      {question?.icon}
    </div>
    <div class="name">
      <span style={question?.solved ? "text-decoration: line-through;" : ""}
        >{question.num}. {question.name}</span
      >
      <br />
      <!-- <span class="subtext">{$q_.brief}</span> -->
      <span class="subtext">{question?.points} points</span>
    </div>
    <div class="status">
      {#if question?.solved}
        ✓
      {/if}
    </div>
  </div>
{/if}

<style>
  .option {
    color: var(--text-sec);
    cursor: pointer;
    padding: 0.3rem;
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-rows: 1fr;
    grid-template-columns: 0.5fr 2.1fr 0.4fr;
    grid-template-rows: 1fr;
    gap: 0px 0px;
    grid-template-areas: "icon name status";
    background-color: var(--bg-sec);
    border: solid 2px transparent;
    border-bottom: solid 2px var(--accent);
  }
  
  .icon {
    grid-area: icon;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Noto Emoji", sans-serif;
  }
  .name {
    grid-area: name;
  }
  .status {
    grid-area: status;
    display: flex;
    align-items: center;
    justify-content: center;
    color: lightgreen;
  }

  .subtext {
    opacity: 0.7;
    font-size: 13px;
  }

  .selected {
    border: solid 2px white;
  }
</style>
