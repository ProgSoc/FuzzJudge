import type { MessageValue, SocketMessage } from "../../../src/live/socketData.ts";
import { onDestroy } from "svelte";
import { unreachable } from "./utils";

function makeSvelteSubscribable<T>() {
  const subscribers = new Set<(value: T) => void>();

  return {
    subscribe: (callback: (value: T) => void) => {
      subscribers.add(callback);

      const unsubscribe = () => {
        subscribers.delete(callback);
      };

      // Unsubscribe if the component is destroyed
      onDestroy(unsubscribe);

      // Return unsubscribe function if the client wants to manually unsubscribe
      return unsubscribe;
    },
    notify: (value: T) => {
      for (const callback of subscribers) {
        callback(value);
      }
    },
  };
}

export function listenOnWebsocket(callback: (data: SocketMessage) => void) {
  const wsAddress = "/";
  const ws = new WebSocket(wsAddress);
  ws.addEventListener("message", ({ data }) => {
    callback(JSON.parse(data));
  });
  ws.addEventListener("error", () => listenOnWebsocket(callback));
}

export function initLiveState() {
  const clockSubscribable = makeSvelteSubscribable<MessageValue<"clock">>();
  // const questionsSubscribable = makeSvelteSubscribable<MessageValue<"questions">>();
  const scoreboardSubscribable = makeSvelteSubscribable<MessageValue<"scoreboard">>();

  listenOnWebsocket((data) => {
    switch (data.kind) {
      case "clock":
        const value = data.value;

        // Fix dates
        clockSubscribable.notify({
          finish: new Date(value.finish),
          hold: value.hold && new Date(value.hold),
          start: new Date(value.start),
        });
        break;
      // case "questions":
      //   questionsSubscribable.notify(data.value);
      //   break;
      case "scoreboard":
        scoreboardSubscribable.notify(data.value);
        break;
      default:
        unreachable(data);
    }
  });

  return {
    listenClock: clockSubscribable.subscribe,
    // listenQuestions: questionsSubscribable.subscribe,
    listenScoreboard: scoreboardSubscribable.subscribe,
  };
}

export type LiveState = ReturnType<typeof initLiveState>;
