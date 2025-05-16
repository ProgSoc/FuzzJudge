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
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { openFuzz } from "../api";
  import { showNotification } from "../notifications";
  import { selectedProblem } from "../utils";
  import { client } from "../gql/sdk";
  import type { JudgeSubmissionMutationVariables } from "../gql";

  let submissionValue = $state("");
  let sourceValue = $state("");

  selectedProblem.subscribe((_) => {
    submissionValue = "";
    sourceValue = "";
  });

  const queryClient = useQueryClient();

  const submitMutation = createMutation({
    mutationFn: (options: JudgeSubmissionMutationVariables) => client.JudgeSubmission(options),
    onSuccess: (data) => {
      if (data.data.judge.__typename === "JudgeErrorOutput") {
        showNotification("Submission failed. Please check the error message.");
      } else {
        showNotification("Submission successful!");
      }
      queryClient.invalidateQueries({
        queryKey: ["problem", $selectedProblem],
      });
      queryClient.invalidateQueries({
        queryKey: ["problemsList"],
      });
    },
    onError: (error) => {
      showNotification("Submission failed. Please check the error message.");
    },
  });

  const fuzzQuery = createQuery({
    queryKey: ["problem", $selectedProblem, "fuzz"],
    queryFn: () => client.ProblemFuzzQuery({ problemSlug: $selectedProblem }),
    select: (data) => data.data.problem.fuzz,
  });

  const submit = (slug: string) => {
    $submitMutation.mutate({
      code: sourceValue,
      output: submissionValue,
      problemSlug: slug,
    });
  };

  const keyHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.altKey && e.key === "Enter") {
      e.preventDefault();

      if (submissionValue.length === 0 || sourceValue.length === 0) {
        showNotification("Please fill in all fields before submitting.");
        return;
      }

      submit($selectedProblem);
    }

    if (e.ctrlKey && e.altKey && e.key === "v") {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        submissionValue = text;
      });
    }
  };
</script>

<div class="problem-submission">
  <div class="section">
    <div class="section submission-areas">
      {#if $fuzzQuery.data}
        <div class="solution-submission">
          <h2>Problem Input</h2>
          <textarea bind:value={$fuzzQuery.data}></textarea>
        </div>
      {/if}
      <div class="solution-submission">
        <h2>Problem Solution</h2>
        <textarea bind:value={submissionValue}></textarea>
      </div>
      <div class="source-submission">
        <h2>Solution source</h2>
        <textarea
          bind:value={sourceValue}
          placeholder="Please include any of the source code used to solve the problem. This may be manually reviewed later."
        ></textarea>
      </div>
    </div>
    <div class="text-area-buttons">
      <button class="submit" onclick={() => submit($selectedProblem)}>
        {$submitMutation.isPending ? "Processing..." : "Submit"}
      </button>
    </div>
  </div>
</div>
<div class="error-message-area">
  {#if $submitMutation.isError}
    <pre class="error-message">
      {$submitMutation.error.message}
    </pre>
  {/if}
  {#if $submitMutation.data?.data.judge.__typename === "JudgeErrorOutput"}
    <pre class="error-message">
      {$submitMutation.data?.data.judge.errors}
    </pre>
  {/if}
</div>

<svelte:window onkeydown={keyHandler} />

<style>
  .section {
    flex-direction: column;
    display: flex;
  }

  .error-message-area {
    min-height: 3rem;
  }

  .submit {
    height: 3rem;
    width: 10rem;
    font-size: 1rem;
    font-weight: bold;
    padding-left: 1.4rem;
    padding-right: 1.4rem;
  }

  .get-input {
    margin-bottom: 1rem;
    margin-left: 0.25rem;
  }

  .input-span {
    color: var(--link);
    text-decoration: underline;
    &:hover {
      cursor: pointer;
    }
  }

  .text-area-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%; /* Ensure the container spans the full width */
  }

  .problem-submission {
    color: var(--text-prim);
    background-color: var(--bg-prim);
    grid-area: problem-submission;
    padding: 0.7rem;
    display: flex;
    justify-content: start;
    flex-direction: column;
    align-content: start;
    flex-wrap: wrap;
    align-items: center;
  }
</style>
