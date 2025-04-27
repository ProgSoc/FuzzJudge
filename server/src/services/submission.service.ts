import { compress } from "@bokuweb/zstd-wasm";
import { z } from "@hono/zod-openapi";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "../db";
import { type Submission, submissionTable } from "../db/schema";
import { ee } from "../ee";
import { getProblemData } from "./problems.service";

interface SubmissionParams extends Omit<Submission, "out" | "code" | "vler"> {
	out: string;
	code: string;
	vler: string;
}

function encStr(input: string) {
	return Buffer.from(compress(new TextEncoder().encode(input)));
}

function decStr(input: Buffer) {
	return new TextDecoder().decode(input);
}

export async function attempts(params: {
	team: number;
	prob: string;
}): Promise<number> {
	// return db.query<[number]>("SELECT COUNT(*) FROM subm WHERE team = :team AND prob = :prob", params)[0][0];
	const attempts = await db.query.submissionTable.findMany({
		where: (table, { and }) =>
			and(eq(table.team, params.team), eq(table.prob, params.prob)),
	});

	return attempts.length;
}

export async function solved(params: {
	team: number;
	prob: string;
}): Promise<boolean> {
	const solved = await db.query.submissionTable.findFirst({
		where: (table, { and }) =>
			and(
				eq(table.team, params.team),
				eq(table.prob, params.prob),
				eq(table.ok, true),
			),
	});

	return solved !== undefined;
}

export async function solvedSet(params: { team: number }): Promise<
	Set<string>
> {
	const solved = await db
		.selectDistinct({ prob: submissionTable.prob })
		.from(submissionTable)
		.where(
			and(
				eq(submissionTable.team, params.team),
				eq(submissionTable.ok, true),
				isNotNull(submissionTable.prob),
			),
		);

	return new Set(solved.filter(Boolean).map((v) => v.prob as string));
}

export async function score(root: string, teamId: number): Promise<number> {
	let total = 0;
	for (const slug of await solvedSet({ team: teamId })) {
		const problemMeta = await getProblemData(root, slug);
		total += problemMeta.problem.points;
	}
	return total;
}

export async function manualJudge(id: number, ok: boolean) {
	// db.query("UPDATE subm SET ok = :ok WHERE id = :id", {id, ok});
	return await db
		.update(submissionTable)
		.set({ ok })
		.where(eq(submissionTable.id, id))
		.returning();
}

export async function postSubmission(
	{ code, ok, out, prob, team, time, vler, vlms }: Omit<SubmissionParams, "id">,
	resubmit = false,
): Promise<number> {
	if (resubmit && ok) {
		if (!prob || !team) throw new Error("Missing prob or team for resubmit");

		const [id] = await db
			.update(submissionTable)
			.set({
				out: Buffer.from(encStr(out)),
				code: Buffer.from(encStr(code)),
				vler: Buffer.from(encStr(vler)),
				vlms,
			})
			.where(
				and(
					eq(submissionTable.prob, prob),
					eq(submissionTable.team, team),
					eq(submissionTable.ok, true),
				),
			)
			.returning();

		if (!id) throw new Error("Failed to update submission");

		return id.id;
	}

	const [newSub] = await db
		.insert(submissionTable)
		.values({
			team,
			prob,
			time,
			out: Buffer.from(encStr(out)),
			code: Buffer.from(encStr(code)),
			ok,
			vler: Buffer.from(encStr(vler)),
			vlms,
		})
		.returning()
		.onConflictDoNothing();

	if (!newSub) throw new Error("Failed to insert submission");

	const id = newSub.id;

	ee.emit("scoreboardUpdate"); // trigger a scoreboard update
	return id;
}

export const SubmissionSkeletonSchema = z.object({
	id: z.number(),
	team: z.number(),
	prob: z.string(),
	time: z.date(),
	ok: z.boolean().nullable(),
});

export async function getSubmissionSkeletons(
	teamId: number,
	problemId: string,
) {
	const submissions = await db.query.submissionTable.findMany({
		where: (table, { and }) =>
			and(eq(table.team, teamId), eq(table.prob, problemId)),
	});

	return submissions.map((v) => {
		return {
			id: v.id,
			team: v.team,
			prob: v.prob,
			time: new Date(v.time),
			ok: v.ok,
		};
	});
}

export async function getSubmissionOut(
	id: number,
): Promise<string | undefined> {
	// const data = db.query<[Uint8Array]>("SELECT out FROM subm WHERE id = :id", { id })[0]?.[0];
	const data = await db.query.submissionTable.findFirst({
		where: (table) => eq(table.id, id),
	});
	if (!data) return;

	return decStr(data.out);
}

export async function getSubmissionCode(
	id: number,
): Promise<string | undefined> {
	// const data = db.query<[Uint8Array]>("SELECT code FROM subm WHERE id = :id", { id })[0]?.[0];
	const data = await db.query.submissionTable.findFirst({
		where: (table) => eq(table.id, id),
	});
	if (!data?.code) return;
	return decStr(data.code);
}

export async function getSubmissionVler(
	id: number,
): Promise<string | undefined> {
	// const data = db.query<[Uint8Array]>("SELECT vler FROM subm WHERE id = :id", { id })[0]?.[0];
	const data = await db.query.submissionTable.findFirst({
		where: (table) => eq(table.id, id),
	});
	if (!data?.vler) return;
	return decStr(data.vler);
}
