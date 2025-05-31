import { GraphQLClient } from "graphql-request";
import { getSdk } from ".";

const gqlClient = new GraphQLClient(import.meta.env.VITE_BACKEND_URL);

export const client = getSdk(gqlClient);
