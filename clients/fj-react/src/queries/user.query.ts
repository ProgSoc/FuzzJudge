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
			select: (data) => data.data.me,
		}),
	userList: () =>
		queryOptions({
			queryKey: userQueryKeys.list(),
			queryFn: () => client.UserListQuery(),
			select: (data) => data.data.users,
		}),
};
