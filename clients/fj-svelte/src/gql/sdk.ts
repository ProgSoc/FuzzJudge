import { GraphQLClient } from "graphql-request";
import { createClient } from "graphql-ws";
import { getSdk } from ".";
import { BACKEND_SERVER } from "../api";

const graphQLClient = new GraphQLClient(BACKEND_SERVER);

export const client = getSdk(graphQLClient);

export const wsClient = createClient({
	url: `${BACKEND_SERVER.replace(/^http/, "ws")}`,
});
