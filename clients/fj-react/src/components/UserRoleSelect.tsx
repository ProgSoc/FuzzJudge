import { UserRole } from "@/gql";
import useUpdateUserMutation from "@/hooks/useUpdateUserMutation";
import { MenuItem, TextField } from "@mui/material";
import { useState } from "react";

export default function UserRoleSelect(props: {
	role: UserRole;
	userId: string;
}) {
	const editUserMutation = useUpdateUserMutation();

	const [value, setValue] = useState<UserRole>(props.role);

	return (
		<TextField
			select
			label="Role"
			value={value}
			onChange={(e) => {
				editUserMutation.mutate({
					role: e.target.value as UserRole,
					userId: props.userId,
				});
				setValue(e.target.value as UserRole);
			}}
			disabled={editUserMutation.isPending}
			fullWidth
		>
			<MenuItem key={UserRole.Admin} value={UserRole.Admin}>
				Admin
			</MenuItem>
			<MenuItem key={UserRole.Competitor} value={UserRole.Competitor}>
				Competitor
			</MenuItem>
		</TextField>
	);
}
