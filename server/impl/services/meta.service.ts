import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { compTable } from "impl/db/schema";

/**
 * Get or set a default meta value
 * @param key - The key to get
 * @returns the meta value
 */
export async function getOrSetDefaultMeta<T extends string | undefined>(
  key: string,
  defaultValue?: T,
): Promise<T extends undefined ? string | null : string> {
  // const value = db.query("SELECT val FROM comp WHERE key = ?").(key)[0]?.[0];
  const value = await db.query.compTable.findFirst({
    where: (table) => eq(table.key, key),
  });

  if (value === undefined && defaultValue !== undefined) {
    // db.query("INSERT INTO comp VALUES (?, ?)", [key, defaultValue]);
    const [defVal] = await db.insert(compTable).values({ key, val: defaultValue }).returning().onConflictDoNothing();
    return defVal.val as T extends undefined ? string | null : string;
  }
  return value?.val as T extends undefined ? string | null : string;
}

/**
 * Set a meta value
 * @param key - The key to set
 * @param value - The value to set
 * @returns the value
 */
export async function setMeta(key: string, value: string): Promise<string> {
  await db
    .insert(compTable)
    .values({ key, val: value })
    .onConflictDoUpdate({
      set: {
        val: value,
      },
      target: [compTable.key],
    });

  return value;
}

/**
 * Get all meta keys and values
 * @returns all meta values
 */
export async function allMeta() {
  const allCompetitions = await db.query.compTable.findMany();

  return Object.fromEntries(allCompetitions.map((comp) => [comp.key, comp.val] as [string, string]));
}
