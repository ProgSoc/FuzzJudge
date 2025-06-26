export interface ScoreboardRowMapper {
	rank: number;
	teamId: string;
	points: number;
	penalty: number;
	problems: ProblemScoreMapper[];
}

export interface ProblemScoreMapper {
	slug: string;
	solved: boolean;
	points: number;
	penalty: number;
	tries: number;
}
