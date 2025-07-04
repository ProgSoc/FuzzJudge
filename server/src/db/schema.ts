import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

export const teamTable = sqliteTable("team", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => ulid()),
	seed: text("seed").notNull(),
	name: text("name").notNull(),
	hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
});

export const teamTableRelations = relations(teamTable, ({ many }) => ({
	users: many(userTable),
	submissions: many(submissionTable),
}));

export const userTable = sqliteTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => ulid()),
	teamId: text("team").references(() => teamTable.id),
	username: text("logn").unique().notNull(),
	password: text("password").notNull(),
	name: text("name").notNull().default(""),
	role: text("role", { enum: ["admin", "competitor"] }).notNull(),
});

export const userTableRelations = relations(userTable, ({ one, many }) => ({
	team: one(teamTable, {
		fields: [userTable.teamId],
		references: [teamTable.id],
	}),
	sessions: many(sessionTable),
}));

export const sessionTable = sqliteTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => userTable.id)
		.notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [sessionTable.userId],
		references: [userTable.id],
	}),
}));

export const submissionTable = sqliteTable("subm", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => ulid()),
	teamId: text("team")
		.references(() => teamTable.id)
		.notNull(),
	prob: text("prob").notNull(),
	time: text("time").notNull(),
	out: text("out"),
	code: text("code"),
	ok: integer("ok", { mode: "boolean" }),
	vler: text("vler"),
	vlms: real("vlms"),
});

export const submissionTableRelations = relations(
	submissionTable,
	({ one }) => ({
		team: one(teamTable, {
			fields: [submissionTable.teamId],
			references: [teamTable.id],
		}),
	}),
);

export type Team = typeof teamTable.$inferSelect;

export type User = typeof userTable.$inferSelect;

export type UserInsert = typeof userTable.$inferInsert;

export type Session = typeof sessionTable.$inferSelect;

export type UserRoles = User["role"];

export type Submission = typeof submissionTable.$inferSelect;
