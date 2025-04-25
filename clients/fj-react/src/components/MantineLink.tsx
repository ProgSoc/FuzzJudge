import { Anchor, type AnchorProps } from "@mantine/core";
import { type LinkComponent, createLink } from "@tanstack/react-router";
import * as React from "react";

interface MantineAnchorProps extends Omit<AnchorProps, "href"> {
	// Add any additional props you want to pass to the anchor
}

const MantineLinkComponent = React.forwardRef<
	HTMLAnchorElement,
	MantineAnchorProps
>((props, ref) => {
	return <Anchor ref={ref} {...props} />;
});

const CreatedLinkComponent = createLink(MantineLinkComponent);

export const MantineLink: LinkComponent<typeof MantineLinkComponent> = (
	props,
) => {
	return <CreatedLinkComponent preload="intent" {...props} />;
};
