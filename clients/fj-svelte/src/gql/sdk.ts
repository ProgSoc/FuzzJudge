import { GraphQLClient } from "graphql-request";
import { createClient } from "graphql-ws";
import { getSdk } from ".";

const BACKEND_SERVER: string = import.meta.env.VITE_BACKEND_URL || "";

const graphQLClient = new GraphQLClient(BACKEND_SERVER);

export const client = getSdk(graphQLClient);

export const wsClient = createClient({
	url: `${BACKEND_SERVER.replace(/^http/, "ws")}`,
});
