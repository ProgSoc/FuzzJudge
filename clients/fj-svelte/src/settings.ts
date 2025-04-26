import { writable } from "svelte/store";

export type UserSettings = {
	theme?: Theme;
	language?: string;
};

export const SETTINGS = writable(loadSettings());

SETTINGS.subscribe((settings) => {
	saveSettings(settings);
});

function loadSettings(): UserSettings {
	const settings = localStorage.getItem("settings");
	if (settings) {
		return JSON.parse(settings) ?? {};
	}
	return {};
}

function saveSettings(settings: UserSettings): void {
	localStorage.setItem("settings", JSON.stringify(settings));
}

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
