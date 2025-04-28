import { NavLink, type NavLinkProps } from "@mantine/core";
import { type LinkComponent, createLink } from "@tanstack/react-router";
import * as React from "react";

interface MantineNavLinkProps extends Omit<NavLinkProps, "href"> {
	// Add any additional props you want to pass to the anchor
}

const MantineLinkComponent = React.forwardRef<
	HTMLAnchorElement,
	MantineNavLinkProps
>((props, ref) => {
	return <NavLink ref={ref} {...props} />;
});

const CreatedLinkComponent = createLink(MantineLinkComponent);

export const MantineNavLink: LinkComponent<typeof MantineLinkComponent> = (
	props,
) => {
	return <CreatedLinkComponent preload="intent" {...props} />;
};
