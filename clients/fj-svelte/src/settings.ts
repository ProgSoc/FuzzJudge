/*
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { writable } from "svelte/store";
import type { Theme } from "./themes/themes";

type UserSettings = {
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
