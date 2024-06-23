import { CompetitionClock } from "../clock.ts";
import { FuzzJudgeProblem } from "../comp.ts";
import { ListenerGroup, makeListenerGroup } from "./notificationService.ts";
import { makeCallDeduper } from "./utils.ts";

type SocketInitArgs = {
  clock: CompetitionClock;
  problems: Record<string, FuzzJudgeProblem>;
};

function makeSocketListenerGroups(args: SocketInitArgs) {
  return {
    clock: makeListenerGroup(() => args.clock.now()),
    scoreboard: makeListenerGroup(() => null),

    // TODO: later
    // questions: makeListenerGroup<Record<string, FuzzJudgeProblem> | null>(() => null),
  };
}

type SocketMessageVariant<K extends string, T> = {
  kind: K;
  value: T;
};

// Using the makeSocketListenerGroups function, extract the message types that would be produced
type SocketChannels = ReturnType<typeof makeSocketListenerGroups>;
export type SocketMessageKind = keyof SocketChannels;
export type SocketMessage = {
  [K in SocketMessageKind]: SocketChannels[K] extends ListenerGroup<infer T> ? SocketMessageVariant<K, T> : never;
}[SocketMessageKind];

// deno-lint-ignore no-explicit-any
type MessageValueFromType<
  T extends SocketMessageVariant<string, any>,
  K extends SocketMessageKind,
> = T extends SocketMessageVariant<K, infer V> ? V : never;
export type MessageValue<K extends SocketMessageKind> = MessageValueFromType<SocketMessage, K>;

export function makeSocketService(args: SocketInitArgs) {
  const listenerGroups = makeSocketListenerGroups(args);

  const competitionStartDeduper = makeCallDeduper();

  // TODO: later
  // let questionsVisible = false;
  // function updateQuestions(clock: CompetitionClock) {
  //   const times = clock.now();
  //   const msUntilStart = Math.floor(Math.max(0, times.start.getTime() - Date.now()));

  //   // If the time was moved forwards, reset the question visibility to null
  //   if (msUntilStart > 0 && questionsVisible) {
  //     listenerGroups.questions.notify(null);
  //     questionsVisible = false;
  //   }

  //   // Queue question visibility to show once the competition is started
  //   competitionStartDeduper.tryRun(msUntilStart, () => {
  //     listenerGroups.questions.notify(args.problems);
  //     questionsVisible = true;
  //   });
  // }

  // Subscribe to clock and question updates
  args.clock.subscribe(async (clock) => {
    listenerGroups.clock.notify(clock.now());
    // updateQuestions(clock);
  });

  // updateQuestions(args.clock);

  const listeners = new Set<(msg: SocketMessage) => void>();
  const subscribe = (listener: (msg: SocketMessage) => void) => {
    listeners.add(listener);

    // Subscribe to all channels
    for (const [key, listenerGroup] of Object.entries(listenerGroups)) {
      listenerGroup.subscribe((value) => {
        // deno-lint-ignore no-explicit-any
        listener({ kind: key as SocketMessageKind, value: value as any });
      });
    }

    return () => listeners.delete(listener);
  };

  return {
    subscribe,
  };
}
