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

export function basicAuth(req: Request): { username: string, password: string } | null {
  const header = req.headers.get("Authorization");
  if (!header) return null;
  if (!header.startsWith("Basic ")) return null;
  const [ username, password ] = atob(header.slice(6)).split(/:(.*)/);
  return { username, password };
}

export interface AuthSchemes<T> {
  basic: (options: {
    username: string,
    password: string,
  }) => T | null,
}

export class Auth<T> {
  #schemes: AuthSchemes<T>;

  constructor(schemes: AuthSchemes<T>) {
    this.#schemes = schemes;
  }

  protect(req: Request): T {
    const header = req.headers.get("Authorization");
    if (header) {
      if (header.startsWith("Basic ")) {
        const [ username, password ] = atob(header.slice(6)).split(/:(.*)/);
        const details = this.#schemes.basic({ username, password });
        if (details !== null) return details;
      }
    }
    throw new Response("Unauthorized.\n", {
      status: 401,
      headers: { "WWW-Authenticate": `Basic charset="utf-8"` },
    });
  }
}
