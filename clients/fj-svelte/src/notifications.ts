import { writable } from "svelte/store";

export const NOTIFICATION = writable<string | undefined>(undefined);

export const showNotification = (message: string) => {
	NOTIFICATION.set(message);
};
