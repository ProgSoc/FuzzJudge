import type { Problem } from "@/gql";

const difficultyToLabel = (difficulty: Problem["difficulty"]) => {
	switch (difficulty) {
		case 1:
			return "Easy";
		case 2:
			return "Medium";
		case 3:
			return "Hard";
		default:
			return "Unknown";
	}
};

export default difficultyToLabel;
