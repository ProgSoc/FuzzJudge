import { eq } from "drizzle-orm";
import { db } from "../db";
import { userTable, type User } from "../db/schema";

export async function basicAuth({ logn, pass }: { logn: string; pass: Uint8Array }): Promise<User | null> {
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
