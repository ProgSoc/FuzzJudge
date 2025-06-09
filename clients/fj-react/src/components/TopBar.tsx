import { AppBar, Toolbar, Typography } from "@mui/material";
import { useRouterState } from "@tanstack/react-router";
import ModeSwitchButton from "./ModeSwitchButton";

export default function TopBar() {
	const matches = useRouterState({ select: (s) => s.matches });

	const title = matches
		.map((match) => match.context.getTitle?.())
		.filter((match) => match !== undefined)
		.at(-1);

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					{title || "FuzzJudge"}
				</Typography>
				<ModeSwitchButton />
			</Toolbar>
		</AppBar>
	);
}
