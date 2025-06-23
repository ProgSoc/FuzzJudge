import { queryOptions } from "@tanstack/react-query";
import { client } from "../gql/client";

export const userQueryKeys = {
	root: ["users"],
	me: () => [...userQueryKeys.root, "me", "details"],
	detail: (id: number) => [...userQueryKeys.root, "user", id, "details"],
	list: () => [...userQueryKeys.root, "list"],
};

export const userQueries = {
	me: () =>
		queryOptions({
			queryKey: userQueryKeys.me(),
			queryFn: () => client.MeQuery(),
			select: (data) => data.data.me,
		}),
	detail: (id: number) =>
		queryOptions({
			queryKey: userQueryKeys.detail(id),
			queryFn: () => client.UserQuery({ id }),
			select: (data) => data.data.user,
		}),
	userList: () =>
		queryOptions({
			queryKey: userQueryKeys.list(),
			queryFn: () => client.UserListQuery(),
			select: (data) => data.data.users,
		}),
};
