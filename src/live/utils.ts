// Makes delayed callbacks, but ensures that when a new callback is made, the previous one is skipped.
export function makeCallDeduper() {
  let dedupeIteration = 0;

  return {
    tryRun: async (delayMs: number, callback: () => void | Promise<void>) => {
      // Mark the current iteration. If this gets increased by another call, then we should skip this iteration.
      dedupeIteration += 1;
      const currentIteration = dedupeIteration;

      // Delay, unless the delay is 0, in which case we don't delay
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // If the iteration has been increased by another call, skip
      if (currentIteration !== dedupeIteration) {
        return;
      }

      // Run the callback if successful
      await callback();
    },
  };
}
