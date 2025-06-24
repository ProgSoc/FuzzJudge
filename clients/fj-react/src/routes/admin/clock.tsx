import { LinkButton } from "@/components/LinkButton";
import useAdjustEndMutation from "@/hooks/useAdjustEndMutation";
import useAdjustStartMutation from "@/hooks/useAdjustStartMutation";
import useHoldClockMutation from "@/hooks/useHoldClockMutation";
import useReleaseClockMutation from "@/hooks/useReleaseClockMutation";
import useReleaseResults from "@/hooks/useReleaseResults";
import { clockQueries } from "@/queries/clock.query";
import {
	Button,
	Container,
	Paper,
	Stack,
	Typography,
	styled,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import type { PickerValue } from "@mui/x-date-pickers/internals";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DateTime } from "luxon";

export const Route = createFileRoute("/admin/clock")({
	beforeLoad: () => ({
		getTitle: () => "Clock Management",
	}),
	component: RouteComponent,
});

const scalarToDateTime = (date: Date | string) =>
	typeof date === "string" ? DateTime.fromISO(date) : DateTime.fromJSDate(date);

const PaddedPaper = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(2),
	flex: 1,
}));

function RouteComponent() {
	const clockStateQuery = useQuery({
		...clockQueries.clockSubscription(),
		select: (data) => data.clock,
	});

	const pauseClockMutation = useHoldClockMutation();
	const releaseClockMutation = useReleaseClockMutation();
	const releaseResultsMutation = useReleaseResults();
	const adjustStartMutation = useAdjustStartMutation();
	const adjustEndMutation = useAdjustEndMutation();

	const handleEndTimeChange = (date: PickerValue) => {
		if (!date) return;

		const isoDate = date.toJSDate();
		adjustEndMutation.mutate({
			endTime: isoDate.toISOString(),
		});
	};

	const handleStartTimeChange = (date: PickerValue) => {
		if (!date) return;

		const isoDate = date.toJSDate();
		adjustStartMutation.mutate({
			pushEndTime: true,
			startTime: isoDate.toISOString(),
		});
	};

	return (
		<Container>
			<Stack spacing={2}>
				<Stack direction="row" spacing={2}>
					{clockStateQuery.data?.start ? (
						<PaddedPaper>
							<Typography variant="h6" component="h6">
								Start Time
							</Typography>
							<DateTimePicker
								value={scalarToDateTime(clockStateQuery.data.start)}
								onChange={handleStartTimeChange}
								loading={adjustStartMutation.isPending}
							/>
						</PaddedPaper>
					) : (
						<PaddedPaper>Clock not started</PaddedPaper>
					)}
					{clockStateQuery.data?.finish ? (
						<PaddedPaper>
							<Typography variant="h6" component="h6">
								Finish Time
							</Typography>
							<DateTimePicker
								value={scalarToDateTime(clockStateQuery.data.finish)}
								onChange={handleEndTimeChange}
								loading={adjustEndMutation.isPending}
							/>
						</PaddedPaper>
					) : (
						<PaddedPaper>Clock not ended</PaddedPaper>
					)}
				</Stack>

				{clockStateQuery.data?.hold ? (
					<PaddedPaper>
						Clock is paused at{" "}
						{scalarToDateTime(clockStateQuery.data.hold).toLocaleString(
							DateTime.DATETIME_MED,
						)}
					</PaddedPaper>
				) : (
					<PaddedPaper>Clock is running</PaddedPaper>
				)}
				<Stack direction="row" spacing={2}>
					<Button
						onClick={() => pauseClockMutation.mutate(undefined)}
						loading={pauseClockMutation.isPending}
					>
						Pause Clock
					</Button>
					<Button
						onClick={() =>
							releaseClockMutation.mutate({ extendDuration: true })
						}
						loading={releaseClockMutation.isPending}
					>
						Release Clock
					</Button>
					<Button
						onClick={() => releaseResultsMutation.mutate(undefined)}
						loading={releaseResultsMutation.isPending}
					>
						Release Results
					</Button>
					<LinkButton
						to="/admin/clock/broadcast"
						variant="contained"
						color="primary"
						replace
						mask={{
							to: "/admin/clock",
						}}
					>
						Create Broadcast
					</LinkButton>
				</Stack>
			</Stack>
			<Outlet />
		</Container>
	);
}
