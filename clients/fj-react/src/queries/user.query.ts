import { queryOptions } from "@tanstack/react-query";
import { client } from "../gql/client";

export const userQueryKeys = {
	root: ["users"],
	me: () => [...userQueryKeys.root, "me", "details"],
	user: (id: number) => [...userQueryKeys.root, "user", id, "details"],
	list: () => [...userQueryKeys.root, "list"],
};

export const userQuery = {
	me: () =>
		queryOptions({
			queryKey: userQueryKeys.me(),
			queryFn: () => client.MeQuery(),
		}),
	userList: () =>
		queryOptions({
			queryKey: userQueryKeys.list(),
			queryFn: () => client.UserListQuery(),
		}),
};
