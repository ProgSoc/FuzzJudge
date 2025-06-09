import { useDisclosure } from "@/hooks/useDisclosure";
import { teamQueries } from "@/queries/team.query";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type {
	FieldPath,
	FieldValues,
	UseControllerProps,
} from "react-hook-form";
import ControlledAutocomplete from "./ControlledAutocomplete";

export default function TeamAutocomplete<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: UseControllerProps<TFieldValues, TName>) {
	const { control, name } = props;

	const { getDisclosureProps, isOpen: isAutocompleteOpen } = useDisclosure();

	const teamsQuery = useQuery({
		...teamQueries.list(),
		enabled: isAutocompleteOpen,
		placeholderData: keepPreviousData,
	});

	const teamOptions = useMemo(
		() =>
			teamsQuery.data?.map((team) => ({
				label: team.name,
				value: team.id,
			})) ?? [],
		[teamsQuery.data],
	);

	return (
		<ControlledAutocomplete
			control={control}
			name={name}
			label="Team"
			placeholder="Select a team"
			helperText="Select a team"
			options={teamOptions}
			loading={teamsQuery.isFetching}
			{...getDisclosureProps()}
		/>
	);
}
