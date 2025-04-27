import { writable } from "svelte/store";
import type { Theme } from "./themes/themes";

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
