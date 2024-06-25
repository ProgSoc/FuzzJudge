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

import { onDestroy } from "svelte";
import { CompState, unreachable, type CompTimes } from "../../utils";

export function secondsToString(seconds: number) {
  // Get hours, minutes, and seconds
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = seconds % 60;

  function pad(n: number) {
    return n < 10 ? "0" + n : n;
  }

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secondsLeft)}`;
  } else {
    return `${minutes}:${pad(secondsLeft)}`;
  }
}

export function secondsToBinary(seconds: number) {
  const binary = seconds.toString(2).padStart(8, "0");
  return binary;
}

export function dateToTimeString(date: Date) {
  // Convert to 12 hour time hh:mm a

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
}
