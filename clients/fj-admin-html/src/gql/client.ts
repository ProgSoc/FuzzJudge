import { GraphQLClient } from "graphql-request";
import { getSdk } from ".";

const gqlClient = new GraphQLClient(`${window.location.origin}/graphql`);

export const client = getSdk(gqlClient);
