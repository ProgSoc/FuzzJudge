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

import { KATEX_CSS, TOML, YAML, renderMarkdown } from "./deps.ts";

export interface FuzzJudgeDocument {
  config?: unknown,
  title?: string,
  summary?: string,
  icon?: string,
  publicAssets?: string[],
  body: string,
}

export function frontMatter(
  text: string,
  parsers: Record<string, (text: string) => unknown> = {
    json: JSON.parse,
    toml: TOML.parse,
    yaml: YAML.parse,
  }
): [unknown, string] {
  const [_all, _delim, format, front] = text.match(/^(`{3,})(\w*)\n(.*?)(?<=\n)\1(\n|$)/s) ?? [];
  if (_all === undefined) return [undefined, text];
  return [parsers[format]?.(front), text.slice(_all.length)];
}

export function loadMarkdown(fileText: string): FuzzJudgeDocument {
  const [config, markdown] = frontMatter(fileText);
  let html = renderMarkdown(markdown, {
    allowMath: true,
  });
  if (html.includes("katex")) {
    html = `<style>\n${indent("    ", KATEX_CSS)}\n</style>\n${html}`;
  }
  const titleRaw = html.match(/<h1.*>(.*?)<\/h1>/)?.[1].replaceAll(/<.*>/g, "");
  const icon = titleRaw?.match(/\p{RGI_Emoji}/v)?.[0];
  const title = (icon !== undefined ? titleRaw?.replace(icon!, "") : titleRaw)?.trim();
  const summary = html.match(/<p.*>(.*?)<\/p>/)?.[1].replaceAll(/<.*>/g, "");
  const publicAssets = markdown.match(/!\[.*\]\((.*?)\)/g)?.map((s) => s.match(/\((.*?)\)/)?.[1]).filter((s) => s !== undefined) as string[];
  return {
    config, title, summary, icon, publicAssets,
    body: title === undefined ? html : html.replace(/<h1.*>(.*?)<\/h1>/, ""),
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
