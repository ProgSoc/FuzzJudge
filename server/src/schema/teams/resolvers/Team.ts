import { db } from "@/db";
import type { TeamResolvers } from "./../../types.generated";
export const Team: TeamResolvers = {
	/* Implement Team resolver logic here */
	members: async ({ id: teamId }, _arg) => {
		const members = await db.query.userTable.findMany({
			where: (userTable, { eq }) => eq(userTable.teamId, teamId),
		});

		return members.map((user) => ({
			id: user.id,
			role: user.role,
			teamId: user.teamId,
			username: user.username,
		}));
	},
	submissions: async ({ id }, _arg) => {
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
