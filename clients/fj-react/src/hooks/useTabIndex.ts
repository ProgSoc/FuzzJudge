import {
	type AnyRouter,
	type NavigateOptions,
	type RegisteredRouter,
	useChildMatches,
} from "@tanstack/react-router";
import { useMemo } from "react";

export type TabItem<
	TRouter extends AnyRouter = RegisteredRouter,
	TFrom extends string = string,
	TTo extends string | undefined = ".",
	TMaskFrom extends string = TFrom,
	TMaskTo extends string = ".",
> = {
	label: string;
	icon?: React.ReactElement | string;
	disabled?: boolean;
	fuzzy?: boolean;
} & NavigateOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>;

interface TabIndexProps {
	tabs: TabItem[];
	defaultIndex?: number;
}

export default function useTabIndex(options: TabIndexProps) {
	const { defaultIndex, tabs } = options;

	const currentChildren = useChildMatches();

	const matchingIndex = useMemo(() => {
		// Find the index of the tab that matches the current route
		const tabIndex = tabs.findIndex((tab) =>
			currentChildren.some((child) => {
				if (!tab.to) return false;

				if (child.fullPath === tab.to) {
					return true;
				}

				if (tab.fuzzy) {
					return child.fullPath.startsWith(tab.to);
				}

				return false;
			}),
		);
		// If no tab matches, use the default index (0)
		return tabIndex === -1 ? defaultIndex : tabIndex;
	}, [currentChildren, tabs, defaultIndex]);

	return matchingIndex;
}
