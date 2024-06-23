type MaybePromise<T> = T | Promise<T>;

type Subscriber<T> = {
  notify: (value: T) => void;
  stop: () => void;
};

export function makeSubscriber<T>(initialValue: MaybePromise<T>, notify: (val: T) => void): Subscriber<T> {
  let queue: T[] | null = [];
  let stopped = false;

  void Promise.resolve(initialValue)
    .then((val) => {
      if (stopped) {
        return;
      }

      notify(val);
      queue?.forEach((val) => notify(val));
      queue = null;
    })
    .catch(() => {
      // If the initial promise errors then we ignore all events
      stopped = true;
      queue = null;
    });

  return {
    notify: (val) => {
      if (stopped) {
        return;
      }

      if (queue) {
        queue.push(val);
      } else {
        notify(val);
      }
    },
    stop: () => {
      stopped = true;
    },
  };
}

export type ListenerGroup<T> = {
  notify: (value: T) => void;
  subscribe: (notify: (value: T) => void) => () => void;
  isEmpty(): boolean;
};

export function makeListenerGroup<T>(getInitialValue: () => MaybePromise<T>) {
  const subscribers = new Set<Subscriber<T>>();
  let currentValue: MaybePromise<T> = getInitialValue();

  return {
    subscribe: (notify: (val: T) => void) => {
      const subscriber = makeSubscriber(currentValue, notify);
      subscribers.add(subscriber);
      const unsubscribe = () => {
        subscriber.stop();
        subscribers.delete(subscriber);
      };
      return unsubscribe;
    },

    notify: (val: T) => {
      currentValue = val;
      subscribers.forEach((subscriber) => subscriber.notify(val));
    },

    isEmpty: () => subscribers.size === 0,
  };
}
