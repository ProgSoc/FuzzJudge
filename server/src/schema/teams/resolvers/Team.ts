import { db } from "@/db";
import { ensureRole } from "@/middleware/graphQLAuthMiddleware";
import type { TeamResolvers } from "./../../types.generated";
export const Team: TeamResolvers = {
	/* Implement Team resolver logic here */
	members: async ({ id: teamId }, _arg, { c }) => {
		await ensureRole(c, ["admin"]);

		const members = await db.query.userTable.findMany({
			where: (userTable, { eq }) => eq(userTable.team, teamId),
		});

		return members.map((user) => ({
			id: user.id,
			role: user.role,
			teamId: user.team ?? undefined,
			logn: user.logn ?? undefined,
		}));
	},
	submissions: async ({ id }, _arg, { c }) => {
		await ensureRole(c, ["admin"]);

		const submission = await db.query.submissionTable.findMany({
			where: (submissionTable, { eq }) => eq(submissionTable.team, id),
		});

		return submission.map((rawSubmission) => ({
			id: rawSubmission.id,
			problemSlug: rawSubmission.prob,
			time: new Date(rawSubmission.time),
			ok: rawSubmission.ok ?? undefined,
			out: rawSubmission.out ?? undefined,
			code: rawSubmission.code ?? undefined,
			vler: rawSubmission.vler ?? undefined,
			teamId: rawSubmission.team,
		}));
	},
};
