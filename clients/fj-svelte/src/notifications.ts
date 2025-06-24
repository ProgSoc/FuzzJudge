import { writable } from "svelte/store";
import { wsClient } from "./gql/sdk";
import { BroadcastDocument, type BroadcastSubscription } from "./gql";

export const NOTIFICATION = writable<string | undefined>(undefined);

export const showNotification = (message: string) => {
	NOTIFICATION.set(message);
};

wsClient.subscribe<BroadcastSubscription>(
	{
		query: BroadcastDocument,
	},
	{
		next: ({ data }) => {
			if (!data?.broadcasts) return;
			showNotification(`${data.broadcasts.title}: ${data.broadcasts.content}`);
		},
		error: (error) => {
			console.error("Error in broadcast subscription:", error);
		},
		complete: () => {
			console.log("Broadcast subscription completed");
		},
	},
);
