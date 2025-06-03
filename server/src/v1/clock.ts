import path from "node:path";
import { competitionRoot } from "@/config.ts";
import { pubSub } from "@/pubsub.ts";
import type { ClockStatus } from "@/schema/types.generated";
import { type Times, competitionSpec } from "@/services/competition.service.ts";
import { GraphQLError } from "graphql";
import { readMarkdown, writeFrontmatter } from "../lib/writeMd.ts";

let cacheNow: Times | null = null;
export async function now() {
	if (cacheNow) {
		return cacheNow;
	}
	const competitionConfig = path.join(competitionRoot, "comp.md");
	// parse the compeition config file to get the start and finish times
	const {
		frontmatter: { times },
	} = await readMarkdown(competitionConfig, competitionSpec);

	cacheNow = times;

	return times;
}

export async function adjustStart(time: Date, moveDuration = false) {
	const currentTimes = await now();
	const delta = currentTimes.start.getTime() - time.getTime();
	const newFinish = moveDuration
		? new Date(currentTimes.finish.getTime() - delta)
		: currentTimes.finish;

	const competitionConfig = path.join(competitionRoot, "comp.md");

	await writeFrontmatter(competitionConfig, competitionSpec, {
		times: {
			start: time.toISOString(),
			finish: newFinish.toISOString(),
		},
	});

	const newTimes = {
		start: time,
		finish: newFinish,
		hold: currentTimes.hold,
	};

	cacheNow = {
		...newTimes,
		freeze: currentTimes.freeze,
	};

	pubSub.publish("clock", newTimes);

	return newTimes;
}

export async function adjustFinish(newFinish: Date) {
	const currentTimes = await now();
	if (newFinish < currentTimes.start)
		throw new Error("Finish time must be after start time.");
	const competitionConfig = path.join(competitionRoot, "comp.md");

	await writeFrontmatter(competitionConfig, competitionSpec, {
		times: {
			finish: newFinish.toISOString(),
		},
	});

	const newTimes = {
		start: currentTimes.start,
		finish: newFinish,
		hold: currentTimes.hold,
	};

	cacheNow = {
		...newTimes,
		freeze: currentTimes.freeze,
	};

	pubSub.publish("clock", newTimes);

	return newTimes;
}

export async function holdClockTime() {
	const currentTimes = await now();
	if (currentTimes.hold) {
		throw new GraphQLError("Clock is already on hold.");
	}
	const competitionConfig = path.join(competitionRoot, "comp.md");
	const holdDate = new Date();
	await writeFrontmatter(competitionConfig, competitionSpec, {
		times: {
			hold: holdDate.toISOString(),
		},
	});

	const newTimes = {
		hold: holdDate,
		start: currentTimes.start,
		finish: currentTimes.finish,
	};

	cacheNow = {
		...newTimes,
		freeze: currentTimes.freeze,
	};

	pubSub.publish("clock", newTimes);

	return newTimes;
}

export async function releaseClockTime(extendDuration = false) {
	const currentTimes = await now();
	if (!currentTimes.hold) {
		throw new GraphQLError("Clock is not on hold.");
	}
	const holdDuration = Date.now() - currentTimes.hold.getTime();
	const newFinish = extendDuration
		? new Date(currentTimes.finish.getTime() + holdDuration)
		: currentTimes.finish;
	const competitionConfig = path.join(competitionRoot, "comp.md");
	await writeFrontmatter(competitionConfig, competitionSpec, {
		times: {
			hold: null,
			finish: newFinish.toISOString(),
		},
	});

	const newTimes = {
		hold: null,
		start: currentTimes.start,
		finish: newFinish,
	};

	cacheNow = {
		...newTimes,
		freeze: currentTimes.freeze,
	};

	pubSub.publish("clock", newTimes);

	return newTimes;
}

export const getCompetitionState = async (
	clockTimes: Awaited<ReturnType<typeof now>>,
): Promise<ClockStatus[]> => {
	const clockState: ClockStatus[] = [];
	if (clockTimes.hold) {
		clockState.push("hold");
	}
	if (clockTimes.start > new Date()) {
		clockState.push("before");
	}
	if (clockTimes.finish < new Date()) {
		clockState.push("after");
	}
	// freeze is derived from the number of minutes until the finish time (from clockTimes.freeze)
	if (
		clockTimes.freeze &&
		clockTimes.finish.getTime() - Date.now() < 60 * 1000 * clockTimes.freeze
	) {
		clockState.push("freeze");
	}
	if (!clockState.length) {
		clockState.push("running");
	}
	return clockState;
};

/**
 * Protect an operation based on the current clock state.
 * This may be part of a directive or a function that checks the clock state before allowing an operation.
 * @param disallow An array of clock states that are not allowed for the operation.
 * @returns The current clock state if the operation is allowed.
 */
export async function protectClock(disallow: ClockStatus[] = ["running"]) {
	const currentTimes = await now();
	const clockState = await getCompetitionState(currentTimes);

	if (clockState.some((state) => disallow.includes(state))) {
		throw new GraphQLError(
			`Operation not allowed in the current clock state: ${clockState.join(", ")}`,
		);
	}
	return clockState;
}
