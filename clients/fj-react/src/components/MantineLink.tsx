import { Anchor, type AnchorProps as MantineAnchorProps } from "@mantine/core";
import {
	type LinkComponent,
	type ToOptions,
	createLink,
} from "@tanstack/react-router";
import * as React from "react";

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
