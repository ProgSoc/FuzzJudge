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
  data: Record<string | number, string | undefined>,
) => Response | BodyInit | undefined | Promise<Response | BodyInit | undefined>;

export interface Route {
  [verbs: Uppercase<string>]: Handler;
  [paths: `/${string}`]: Route | Handler;
}

export class Router {
  #table: Route;
  #routes: Record<string, { pattern: URLPattern, handler?: Handler, methods?: { [verb: Uppercase<string>]: Handler } }> = {};

  constructor(route: Route) {
    this.#table = route;
    this.update(table => table);
  }

  #extract(base: string, baseRoute: Route) {
    for (const [pathOrVerb, handlerOrRoute] of Object.entries(baseRoute)) {
      if (pathOrVerb.startsWith("/")) {
        const path = pathOrVerb;
        if (handlerOrRoute instanceof Function) {
          const handler = handlerOrRoute;
          const pathname = base + path;
          this.#routes[pathname] = {
            pattern: new URLPattern({ pathname }),
            handler,
          };
        } else {
          const route = handlerOrRoute;
          this.#extract(base + path, route);
        }
      } else {
        const verb = pathOrVerb as Uppercase<string>;
        const handler = handlerOrRoute;
        const pathname = base || "/";
        const route = this.#routes[pathname] ??= {
          pattern: new URLPattern({ pathname }),
          methods: {},
        };
        (route.methods!)[verb] = handler;
      }
    }
  }

  update(map: (route: Route) => Route) {
    this.#table = map(this.#table);
    this.#extract("", this.#table);
  }

  async route(req: Request): Promise<Response> {
    for (const [_, { pattern, handler, methods }] of Object.entries(this.#routes)) {
      const result = pattern.exec(req.url)?.pathname;
      if (result !== undefined) {
        const responseOrBodyInit = await (methods?.[req.method.toUpperCase() as Uppercase<string>] ?? handler)?.(req, result.groups);
        if (responseOrBodyInit instanceof Response) {
          return responseOrBodyInit;
        }
        else if (responseOrBodyInit === undefined) {
          if (Object.keys(methods ?? {}).length > 0) {
            return new Response("405 Method Not Allowed (No method handler)", { status: 405 })
          } else {
            return new Response("404 Not Found (No resource)", { status: 404 });
          }
        }
        else {
          return new Response(responseOrBodyInit);
        }
      }
    }
    return new Response("404 Not Found (No route)", { status: 404 });
  }
}
