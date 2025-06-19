import { competitionRoot } from "@/config";
import { getCompetitionData } from "@/services/competition.service";
import type { QueryResolvers } from "./../../../types.generated";
export const competition: NonNullable<QueryResolvers["competition"]> = async (
	_parent,
	_arg,
	_ctx,
) => {
	const competitionData = await getCompetitionData(competitionRoot);

	return {
		instructions: competitionData.attributes.body,
		name: competitionData.attributes.title,
	};
};
