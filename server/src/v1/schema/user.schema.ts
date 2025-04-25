import { z } from "@hono/zod-openapi";

export const UserRoleSchema = z
	.enum(["admin", "competitor"])
	.openapi("UserRole");

export const UserSchema = z
	.object({
		id: z.number(),
		team: z.number().nullable(),
		name: z.string().nullable(),
		logn: z.string(),
		salt: z.unknown(),
		hash: z.unknown(),
		role: UserRoleSchema.nullable(),
	})
	.openapi("User");
