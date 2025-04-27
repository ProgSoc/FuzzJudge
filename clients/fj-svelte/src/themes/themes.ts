export enum Theme {
	Default = "Default",
	Nord = "Nord",
	Catppuccin = "Catppuccin",
	GruvboxLight = "Gruvbox Light",
	GruvboxDark = "Gruvbox Dark",
	Wikipedia = "Wikipedia",
	OGFuzzJudge = "OG FuzzJudge",
}

export function themeClass(theme: Theme): string {
	return `theme-${theme.toLowerCase().replace(/ /g, "-")}`;
}
