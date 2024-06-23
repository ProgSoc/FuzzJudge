import { CompetitionClock } from "../clock.ts";
import { ListenerGroup, makeListenerGroup } from "./notificationService.ts";

type SocketInitArgs = {
  clock: CompetitionClock;
};

function makeSocketListenerGroups(args: SocketInitArgs) {
  return {
    clock: makeListenerGroup(() => args.clock.now()),
    scoreboard: makeListenerGroup(() => null),
    questions: makeListenerGroup(() => null),
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

export function makeSocketService(args: SocketInitArgs) {
  const listenerGroups = makeSocketListenerGroups(args);

  // Subscribe to clock
  args.clock.subscribe((clock) => {
    listenerGroups.clock.notify(clock.now());
  });

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
