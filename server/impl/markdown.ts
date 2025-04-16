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

import { TOML } from "bun";
import * as YAML from '@std/yaml'
import path from "path";

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
        const newLink = path.normalize("/" + link);
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
