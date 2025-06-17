import type { DateTime, DurationObjectUnits } from "luxon";
import { useEffect, useState } from "react";

export default function Countdown(props: {
	to: DateTime;
}) {
	const { to } = props;
	const [diffNow, setDiffNow] = useState<DurationObjectUnits>(
		to.diffNow(["days", "hours", "minutes", "seconds"]).toObject(),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			const newDiff = to
				.diffNow(["days", "hours", "minutes", "seconds"])
				.rescale();
			setDiffNow(newDiff.toObject());
		}, 1000);
		return () => clearInterval(interval);
	}, [to]);

	const formattedDays = Math.floor(diffNow.days || 0);
	const formattedHours = Math.floor(diffNow.hours || 0);
	const formattedMinutes = Math.floor(diffNow.minutes || 0);
	const formattedSeconds = Math.floor(diffNow.seconds || 0);

	return (
		<span>
			{`${formattedDays}d `}
			{`${formattedHours}h `}
			{`${formattedMinutes}m `}
			{`${formattedSeconds}s`}
		</span>
	);
}
