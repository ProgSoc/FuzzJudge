<script lang="ts">
    import ListGroup from "./ListGroup.svelte";
    import { type QuestionMeta } from "../utils";

    export let sorted_questions: Record<string, QuestionMeta[]> = {};
    let open: boolean = true;

    function toggleOpen() {
        open = !open;
    }
</script>

<!-- Navbar markup -->

<!-- Main content -->
{#if open}
    <div class="question-list">
        <div class="list-title-div">
            <h2 class="list-title">Questions</h2>
            <button class="toggle-button" on:click={toggleOpen}>
                {#if open}
                    &#60;
                {:else}
                    &#62;
                {/if}
            </button>
        </div>

        <ListGroup name="Easy" list={sorted_questions["1"] ?? []} />
        <ListGroup name="Medium" list={sorted_questions["2"] ?? []} />
        <ListGroup name="Hard" list={sorted_questions["3"] ?? []} />
        <ListGroup name="Other" list={sorted_questions["other"] ?? []} />
    </div>
{:else}
    <div class="closed-question-list">
        <button class="toggle-button" on:click={toggleOpen}>
            {#if open}
                &#60;
            {:else}
                &#62;
            {/if}
        </button>
    </div>
{/if}

<style>
    .toggle-button {
        color: var(--btn-text);
        border: none;
        padding: 0.5rem;
        margin: 1rem;
        cursor: pointer;
        font-weight: bold;
        background-color: var(--accent);
        color: var(--text-sec);
        border: none;
        cursor: pointer;
        border-radius: 0.5rem;
    }
    .question-list {
        grid-area: question-list;
        color: var(--text-sec);
        background-color: var(--bg-sec);
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .list-title {
        padding-left: 1rem;
        width: 100%;
    }

    @media (width >= 1250px) {
        .question-list {
            min-width: max-content;
            overflow: hidden;
        }
    }

    .closed-question-list {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        background-color: var(--bg-sec);
        color: var(--text-sec);
        max-width: fit-content;
    }
    .list-title-div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;
    }
</style>
