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

export interface AuthSchemes<UserDetails> {
  basic: (options: { username: string; password: string }) => UserDetails | null | Promise<UserDetails | null>;
}

export class Auth<UserDetails> {
  #schemes: AuthSchemes<UserDetails>;

  constructor(schemes: AuthSchemes<UserDetails>) {
    this.#schemes = schemes;
  }

  async protect(ctx: Request): Promise<UserDetails> {
    const header = ctx.headers.get("Authorization");
    if (header) {
      if (header.startsWith("Basic ")) {
        try {
          const [username, password] = atob(header.slice(6)).split(/:(.*)/);
          if (username == "") this.reject();
          const details = await this.#schemes.basic({ username, password });
          if (details !== null) return details;
        } catch (e) {
          if (e instanceof DOMException && e.message === "InvalidCharacterError") {
            throw new Response("400 Bad Request ('Basic' Header not base64)\n", { status: 400 });
          } else {
            throw e;
          }
        }
      }
    }
    this.reject();
  }

  reject(): never {
    throw new Response("401 Unauthorized\n", {
      status: 401,
      headers: { "WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"` },
    });
  }
}
