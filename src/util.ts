/*
 * FuzzJudge - Randomised input judging server, designed for ProgComp.
 * Copyright (C) 2024 UTS Programmers' Society (ProgSoc)
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { TOML, YAML, normalize } from "./deps.ts";

export interface MarkdownDocument {
  front?: unknown;
  title?: string;
  icon?: string;
  summary?: string;
  body: string;
  publicAssets: Set<string>;
}

export function frontMatter(
  text: string,
  parsers: Record<string, (text: string) => unknown> = {
    json: JSON.parse,
    toml: TOML.parse,
    yaml: YAML.parse,
  },
): { front?: unknown; body: string } {
  const [_all, _delim, format, front] = text.match(/^(`{3,})([^ ]*?)\n(.*?)(?<=\n)\1(\n|$)/s) ?? [];
  if (_all === undefined) return { body: text };
  return { front: parsers[format]?.(front), body: text.slice(_all.length) };
}

export function loadMarkdown(text: string, linkPrefix = ""): MarkdownDocument {
  const { front, body } = frontMatter(text);
  const [titleMatch, titleHead, icon, titleTail] =
    body.match(new RegExp(`^# (.*?)(\\p{RGI_Emoji})?(.*)\\n?`, "mv")) ?? [];
  const title = ((titleHead || "") + (titleTail || "")).trim().replaceAll(/\s{+}/g, " ");
  const summary = body.match(/^[A-Za-z].*(?:\n[A-Za-z].*)*/m)?.[0];
  const publicAssets = new Set<string>();
  let outputBody = body
    .replaceAll(/!?\[.*?\]\((.+?)\)/g, (match, link) => {
      if (link.startsWith("//") || /^\w+:/.test(link)) {
        return match;
      } else if (linkPrefix !== "") {
        const newLink = normalize("/" + link);
        publicAssets.add(newLink);
        return match.replace(link, linkPrefix + newLink);
      } else {
        publicAssets.add(link);
        return match;
      }
    })
    .trim();
  if (outputBody.length > 0) outputBody += "\n";
  return {
    front,
    title,
    summary,
    icon,
    publicAssets,
    body: titleMatch === undefined ? outputBody : outputBody.replace(titleMatch, ""),
  };
}

export function undent(text: string): string {
  const trimmed = text.replace(/^\s*\n(?=\s*[^\s])/, "").replace(/(?<=\n)\s*$/, "");
  const indent = trimmed.match(/^\s*/)?.[0].replaceAll("\t", "\\t") ?? "";
  return trimmed.replaceAll(new RegExp("^" + indent, "gm"), "");
}

export function indent(pre: string, text: string): string {
  return text.replaceAll(/^/gm, pre);
}

export type SubscriptionHandler<T> = (msg: T) => void | Promise<void>;

export class Subscribable<T> {
  #subscribers: Set<SubscriptionHandler<T>> = new Set();
  #getInitial?: () => T;

  constructor(getInitial?: () => T) {
    this.#getInitial = getInitial;
  }

  subscribe(fn: SubscriptionHandler<T>) {
    this.#subscribers.add(fn);
    if (this.#getInitial) fn(this.#getInitial());
    return fn;
  }

  unsubscribe(fn: SubscriptionHandler<T>) {
    this.#subscribers.delete(fn);
  }

  notify(msg: T) {
    for (const handler of this.#subscribers) handler(msg);
  }
}

export type SubscriptionGroupMessage<T extends Record<string, unknown>> = {
  [K in keyof T]: { kind: K; value: T[K] };
}[keyof T];

export class SubscriptionGroup<T extends Record<string, unknown>> extends Subscribable<SubscriptionGroupMessage<T>> {
  #channels: { [K in keyof T]: Subscribable<T[K]> };
  #subscriptions: Map<SubscriptionHandler<SubscriptionGroupMessage<T>>, { [K in keyof T]: SubscriptionHandler<T[K]> }> =
    new Map();

  constructor(channels: { [K in keyof T]: Subscribable<T[K]> }) {
    super();
    this.#channels = channels;
  }

  subscribe(fn: SubscriptionHandler<SubscriptionGroupMessage<T>>): SubscriptionHandler<SubscriptionGroupMessage<T>> {
    if (this.#subscriptions.has(fn)) return fn;
    const subscription = Object();
    for (const kind in this.#channels) {
      const target = this.#channels[kind];
      const handler = target.subscribe((msg) => fn({ kind, value: msg }));
      subscription[kind] = handler;
    }
    this.#subscriptions.set(fn, subscription);
    return fn;
  }

  unsubscribe(fn: SubscriptionHandler<SubscriptionGroupMessage<T>>) {
    const subscription = this.#subscriptions.get(fn);
    if (!subscription) return;
    for (const kind in this.#channels) {
      const target = this.#channels[kind];
      target.unsubscribe(subscription[kind]);
    }
    this.#subscriptions.delete(fn);
  }

  notify(msg: SubscriptionGroupMessage<T>): void {
    for (const [handler, _] of this.#subscriptions) handler(msg);
  }
}
