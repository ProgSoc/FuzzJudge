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

export type Handler = (
  req: Request,
  data: Record<string, string>,
) => Response | BodyInit | undefined | Promise<Response | BodyInit | undefined>;

export interface Route {
  [verbs: Uppercase<string>]: Handler;
  [paths: `/${string}`]: Route | Handler;
}

export function expectMime(ctx: Request, type: string) {
  if (ctx.headers.get("Content-Type") !== type) {
    throw new Response(`415 Unsupported Media Type\n\nExpected '${type}'`, { status: 415 });
  }
}

export async function expectForm<T extends Record<string, null | ((value: string) => unknown)>>(
  ctx: Request,
  fields: T,
): Promise<{ [K in keyof T]: T[K] extends (value: string) => unknown ? ReturnType<T[K]> : string }> {
  expectMime(ctx, "application/x-www-form-urlencoded");
  const params = new URLSearchParams(await ctx.text());
  return Object.fromEntries(
    Object.entries(fields).map(([field, map]) => {
      const value = params.get(field);
      if (value === null) throw new Response(`400 Bad Request\n\nMissing form field '${field}'\n`, { status: 400 });
      return [field, map?.(value) ?? value];
    }),
  ) as { [K in keyof T]: T[K] extends (value: string) => unknown ? ReturnType<T[K]> : string };
}

export function catchWebsocket(
  ctx: Request,
  handler: (socket: WebSocket) => void,
): void | never {
  if (ctx.headers.get("Upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(ctx);
    handler(socket);
    throw response;
  }
}
