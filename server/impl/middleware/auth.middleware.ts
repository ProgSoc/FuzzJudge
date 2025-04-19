import { createMiddleware } from "hono/factory";
import { auth } from "hono/utils/basic-auth";
import { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import { z } from "@hono/zod-openapi";

/**
 * export async function basicAuth({ logn, pass }: { logn: string; pass: Uint8Array }): Promise<User | null> {
   // const user = db.queryEntries<User>("SELECT * FROM user WHERE logn = :logn", { logn })[0] ?? null;
   const user = await db.query.userTable.findFirst({
     where: (table) => eq(table.logn, logn),
   });
 
   if (!user) return null;
   const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array([...pass, ...user.salt])));
   // Password reset mode, overwrite with new password.
   if (user.hash === null) {
     // db.query("UPDATE user SET hash = :hash WHERE id = :id", { hash, id: user.id });
     db.update(userTable).set({ hash }).where(eq(userTable.id, user.id)).returning();
     user.hash = hash;
   }
   // normal authentication flow
   else {
     let matches = true;
     // SECURITY: scan full list to avoid any potential side-channel
     for (let i = 0; i < hash.length; ++i) if (hash[i] !== (user.hash as Uint8Array<ArrayBuffer>)[i]) matches = false;
     if (!matches) return null;
   }
   return user;
 }
 

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
             throw new HTTPException(400, { message: "400 Bad Request ('Basic' Header not base64)\n"});
           } else {
             throw e;
           }
         }
       }
     }
     this.reject();
   }
 
   reject(): never {
     const res = new Response("401 Unauthorized\n", {
       status: 401,
       headers: { "WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"` },
     });
     throw new HTTPException(401, {
     res
     })
   }
 }
 
 */

import { Hono } from "hono";
import { User } from "../db/schema";
import { HTTPException } from "hono/http-exception";

interface CustomBasicAuthOptions<T extends User> {
  verifyUser: (username: string, password: string) => Promise<T | null>;
  roles?: T["role"][];
}

export const authMiddleware = <T extends User>(options: CustomBasicAuthOptions<T>) =>
  createMiddleware<{
    Variables: {
      user: T;
    };
  }>(async (c, next) => {
    const basicCredentials = auth(c.req.raw);

    if (!basicCredentials) {
      return c.body("401 Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"` },
      });
    }

    const { username, password } = basicCredentials;
    const user = await options.verifyUser(username, password);

    if (!user) {
      return c.body("401 Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"` },
      });
    }

    if (options.roles?.length && !options.roles.includes(user.role)) {
      return c.body("403 Forbidden", {
        status: 403,
      });
    }

    c.set("user", user);

    return next();
  });

export const forbiddenResponse = {
  description: "Forbidden",
  content: {
    "text/plain": {
      schema: z.string(),
    },
  },
} satisfies ResponseConfig;

export const unauthorizedResponse = {
  description: "Unauthorized",
  content: {
    "text/plain": {
      schema: z.string(),
    },
  },
} satisfies ResponseConfig;