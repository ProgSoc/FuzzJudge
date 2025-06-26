import type { UserListQueryQuery } from "@/gql";
import useUpdateUserMutation from "@/hooks/useUpdateUserMutation";
import { teamQueries } from "@/queries/team.query";
import { Autocomplete, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export default function UserTeamSelect(props: {
	team: UserListQueryQuery["users"][number]["team"];
	userId: string;
}) {
	const { team } = props;

	const valueLabel = useMemo(() => {
		if (!team) return null;
		return {
			label: team.name,
			value: team.id,
		};
	}, [team]);

	const teamOptions = useQuery({
		...teamQueries.list(),
		select: (data) =>
			data.data.teams.map((team) => ({
				label: team.name,
				value: team.id,
			})),
	});

	const editUserMutation = useUpdateUserMutation();

	const [value, setValue] = useState<{ label: string; value: string } | null>(
		valueLabel,
	);

	return (
		<Autocomplete
			options={teamOptions.data ?? []}
			renderInput={(params) => <TextField {...params} label="Team" />}
			loading={teamOptions.isLoading || editUserMutation.isPending}
			onChange={(_e, v) => {
				setValue(v);
				editUserMutation.mutate({
					teamId: v?.value ?? null,
					userId: props.userId,
				});
			}}
			value={value}
		/>
	);
}
