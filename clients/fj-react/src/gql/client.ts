import { GraphQLClient } from "graphql-request";
import { createClient } from "graphql-ws";
import {
	ClockSubscriptionDocument,
	type ClockSubscriptionSubscription,
	getSdk,
} from ".";

const graphQLClient = new GraphQLClient(`${window.location.origin}/graphql`);

export const client = getSdk(graphQLClient);

export const wsClient = createClient({
	url: `${window.location.origin.replace("http", "ws")}/graphql`,
});
