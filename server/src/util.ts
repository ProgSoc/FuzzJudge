/*
 * FuzzJudge - Randomised input judging server, designed for ProgComp.
 * Copyright (C) 2024 UTS Programmers' Society (ProgSoc)
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

export function undent(text: string): string {
	const trimmed = text
		.replace(/^\s*\n(?=\s*[^\s])/, "")
		.replace(/(?<=\n)\s*$/, "");
	const indent = trimmed.match(/^\s*/)?.[0].replaceAll("\t", "\\t") ?? "";
	return trimmed.replaceAll(new RegExp(`^${indent}`, "gm"), "");
}

export function indent(pre: string, text: string): string {
	return text.replaceAll(/^/gm, pre);
}

export function deleteFalsey(
	obj: Record<string, unknown>,
): Record<string, unknown> {
	for (const k in obj) if (!obj[k]) delete obj[k];
	return obj;
}
