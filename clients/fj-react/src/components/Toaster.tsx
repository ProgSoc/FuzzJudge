import {
	BroadcastSubscriptionDocument,
	type BroadcastSubscriptionSubscription,
} from "@/gql";
import { wsClient } from "@/gql/client";
import CustomMarkdown from "@/utils/mdSettings";
import { Alert, AlertTitle } from "@mui/material";
import { normalizeProps, useMachine } from "@zag-js/react";
import * as toast from "@zag-js/toast";
import { useId } from "react";

// 1. Create the toast store
export const toaster = toast.createStore({
	overlap: true,
	placement: "bottom-start",
});

wsClient.subscribe<BroadcastSubscriptionSubscription>(
	{
		query: BroadcastSubscriptionDocument,
	},
	{
		next: ({ data }) => {
			if (!data?.broadcasts) return;
			toaster.create({
				title: data.broadcasts.title,
				description: data.broadcasts.content,
				id: data.broadcasts.id,
				closable: true,
				type: "info",
				duration: Number.POSITIVE_INFINITY,
			});
		},
		error: (error) => {
			console.error("Error in broadcast subscription:", error);
		},
		complete: () => {
			console.log("Broadcast subscription completed");
		},
	},
);

interface ToastProps {
	actor: toast.Options<React.ReactNode>;
	index: number;
	parent: toast.GroupService;
}

// 2. Design the toast component
function Toast(props: ToastProps) {
	const { actor, index, parent } = props;
	const composedProps = { ...actor, index, parent };

	const service = useMachine(toast.machine, composedProps);
	const api = toast.connect(service, normalizeProps);

	//   return (
	//     <div {...api.getRootProps()}>
	//       <h3 {...api.getTitleProps()}>{api.title}</h3>
	//       <p {...api.getDescriptionProps()}>{api.description}</p>
	//       <button onClick={api.dismiss}>Close</button>
	//     </div>
	//   )
	return (
		<Alert
			onClose={api.dismiss}
			severity={api.type !== "loading" ? (api.type as "success") : "info"}
			sx={{ width: "100%" }}
		>
			{api.title ? <AlertTitle>{api.title}</AlertTitle> : null}
			<CustomMarkdown>{api.description}</CustomMarkdown>
		</Alert>
	);
}

// 3. Design the toaster
export function Toaster() {
	const service = useMachine(toast.group.machine, {
		id: useId(),
		store: toaster,
	});
	const api = toast.group.connect(service, normalizeProps);
	return (
		<div {...api.getGroupProps()}>
			{api.getToasts().map((toast, index) => (
				<Toast key={toast.id} actor={toast} parent={service} index={index} />
			))}
		</div>
	);
}
