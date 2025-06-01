import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const teamTable = sqliteTable("team", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	seed: text("seed").notNull(),
	name: text("name").notNull(),
	hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
});

export const teamTableRelations = relations(teamTable, ({ many }) => ({
	users: many(userTable),
	submissions: many(submissionTable),
}));

export const userTable = sqliteTable("user", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	team: integer("team").references(() => teamTable.id),
	logn: text("logn").unique().notNull(),
	password: text("password"),
	name: text("name"),
	role: text("role", { enum: ["admin", "competitor"] }).notNull(),
});

export const userTableRelations = relations(userTable, ({ one }) => ({
	team: one(teamTable, {
		fields: [userTable.team],
		references: [teamTable.id],
	}),
}));

export const submissionTable = sqliteTable("subm", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	team: integer("team")
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
			fields: [submissionTable.team],
			references: [teamTable.id],
		}),
	}),
);

export const compTable = sqliteTable("comp", {
	key: text("key").primaryKey(),
	val: text("val"),
});

export type Team = typeof teamTable.$inferSelect;

export type User = typeof userTable.$inferSelect;

export type UserRoles = User["role"];

export type Submission = typeof submissionTable.$inferSelect;

export type Comp = typeof compTable.$inferSelect;
