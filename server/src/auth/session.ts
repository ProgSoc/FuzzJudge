import { type Session, type User, sessionTable, userTable } from "@/db/schema";
import { sha256 } from "@oslojs/crypto/sha2";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { db } from "../db";

async function validateSessionToken(
	token: string,
): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const [sessionRow] = await db
		.select()
		.from(sessionTable)
		.where(eq(sessionTable.id, sessionId))
		.innerJoin(userTable, eq(sessionTable.userId, userTable.id));

	if (!sessionRow) {
		return { session: null, user: null };
	}

	const { session, user } = sessionRow;

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
		return { session: null, user: null };
	}

	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		const newExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		const [updatedSession] = await db
			.update(sessionTable)
			.set({ expiresAt: newExpiry })
			.where(eq(sessionTable.id, session.id))
			.returning();

		if (!updatedSession) {
			console.error("Failed to update session expiry");
			return { session: null, user: null };
		}

		return { session: updatedSession, user };
	}
	return { session, user };
}

export const getCurrentSession = async (
	c: Context,
): Promise<SessionValidationResult> => {
	const token = getCookie(c, "session") ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validateSessionToken(token);
	return result;
};

export async function invalidateSession(sessionId: string): Promise<void> {
	// db.execute("DELETE FROM session WHERE id = ?", [sessionId]);
	await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateUserSessions(userId: number): Promise<void> {
	// db.execute("DELETE FROM session WHERE user_id = ?", [userId]);
	await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export function setSessionTokenCookie(
	c: Context,
	token: string,
	expiresAt: Date,
): void {
	setCookie(c, "session", token, {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt,
	});
}

export function deleteSessionTokenCookie(c: Context): void {
	setCookie(c, "session", "", {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0,
	});
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
	return token;
}

export async function createSession(
	token: string,
	userId: number,
): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
	};
	await db.insert(sessionTable).values(session).returning();

	return session;
}

export type SessionWithUser = {
	session: Session;
	user: User;
};
export type NullSessionAndUser = {
	session: null;
	user: null;
};

export type SessionValidationResult = SessionWithUser | NullSessionAndUser;
