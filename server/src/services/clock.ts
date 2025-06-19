import path from "node:path";
import { competitionRoot } from "@/config";
import { pubSub } from "@/pubsub";
import { type Times, competitionSpec } from "@/services/competition.service";
import { calculateScoreboard } from "@/services/score";
import { GraphQLError } from "graphql";
import { readMarkdown, writeCompetitionTimes } from "../lib/writeMd";

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

	const newTimes = await writeCompetitionTimes(competitionConfig, {
		start: time,
		finish: newFinish,
	});
	cacheNow = newTimes;

	pubSub.publish("clock", newTimes);

	return newTimes;
}

export async function adjustFinish(newFinish: Date) {
	const currentTimes = await now();
	if (newFinish < currentTimes.start)
		throw new GraphQLError("New finish time cannot be before the start time.");
	const competitionConfig = path.join(competitionRoot, "comp.md");

	const newTimes = await writeCompetitionTimes(competitionConfig, {
		finish: newFinish,
	});
	cacheNow = newTimes;

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
	const newTimes = await writeCompetitionTimes(competitionConfig, {
		hold: holdDate,
	});
	cacheNow = newTimes;

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
	const competitionConfigPath = path.join(competitionRoot, "comp.md");

	const newTimes = await writeCompetitionTimes(competitionConfigPath, {
		hold: null,
		finish: newFinish,
	});

	cacheNow = newTimes;

	pubSub.publish("clock", newTimes);

	return newTimes;
}

export const releaseResults = async () => {
	const currentTimes = await now();
	if (currentTimes.isReleased) {
		throw new GraphQLError("Results are already released.");
	}
	const competitionConfigPath = path.join(competitionRoot, "comp.md");
	const newTimes = await writeCompetitionTimes(competitionConfigPath, {
		isReleased: true,
	});

	cacheNow = newTimes;
	pubSub.publish("clock", newTimes);

	const scoreboard = await calculateScoreboard();
	pubSub.publish("scoreboard", scoreboard);

	return newTimes;
};

/**
 * Determines the current state of the competition based on the current time.
 * @returns Boolean indicating whether the competition is currently running. e.g. the current time is between the start and finish times, and the clock is not on hold.
 */
export const isRunning = async () => {
	const currentTimes = await now();
	const nowDate = new Date();
	return (
		nowDate >= currentTimes.start &&
		nowDate <= currentTimes.finish &&
		!currentTimes.hold
	);
};

/**
 * Determins when the scoreboard is not published and is frozen.
 * @returns `true` if the competition is in a state where the scoreboard is frozen
 */
export const isFrozen = async () => {
	const currentTimes = await now();
	const nowDate = new Date();

	const freezeMillis = currentTimes.freeze * 60 * 1000; // convert minutes to milliseconds

	const freezeStart = new Date(currentTimes.finish.getTime() - freezeMillis);

	const afterFreeze = nowDate >= freezeStart;

	return afterFreeze && !currentTimes.isReleased; // Only frozen if after the freeze start time and results are not released
};
