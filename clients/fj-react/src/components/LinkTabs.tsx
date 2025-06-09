import useTabIndex, { type TabItem } from "@/hooks/useTabIndex";
import { Tab, type TabProps } from "@mui/material";
import { Tabs, type TabsProps } from "@mui/material";
import { type LinkComponent, createLink } from "@tanstack/react-router";
import * as React from "react";

interface MUILinkProps extends Omit<TabProps, "href"> {
	// Add any additional props you want to pass to the button
}

const MUILinkComponent = React.forwardRef<HTMLAnchorElement, MUILinkProps>(
	(props, ref) => {
		return <Tab component={"a"} ref={ref} {...props} />;
	},
);

const CreatedLinkComponent = createLink(MUILinkComponent);

const LinkTab: LinkComponent<typeof MUILinkComponent> = (props) => {
	return <CreatedLinkComponent preload={"intent"} {...props} />;
};

interface LinkTabsProps extends Omit<TabsProps, "value"> {
	tabs: TabItem[];
	defaultIndex?: number;
}

/**
 * A component that renders a set of tabs that link to different routes.
 * @returns
 */
export default function LinkTabs(props: LinkTabsProps) {
	const { tabs, defaultIndex = 0, ...rest } = props;

	const matchingIndex = useTabIndex({
		tabs,
		defaultIndex,
	});

	return (
		<Tabs value={matchingIndex} {...rest}>
			{tabs.map((tab, index) => (
				<LinkTab
					to={tab.to}
					params={tab.params}
					key={tab.label}
					label={tab.label}
					value={index}
				/>
			))}
		</Tabs>
	);
}
