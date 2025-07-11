import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormProps, useForm } from "react-hook-form";
import type { z } from "zod/v3";

export default function useZodForm<TSchema extends z.ZodTypeAny>(
	props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
		schema: TSchema;
	},
) {
	const form = useForm<TSchema["_input"]>({
		...props,
		resolver: zodResolver(props.schema, undefined),
	});

	return form;
}

export type ZodSubmitHandler<TSchema extends z.ZodType> = (
	data: TSchema["_input"],
	event?: React.BaseSyntheticEvent,
) => void | Promise<void>;
