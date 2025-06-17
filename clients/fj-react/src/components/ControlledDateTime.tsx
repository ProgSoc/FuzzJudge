import {
	DateTimePicker,
	type DateTimePickerFieldProps,
} from "@mui/x-date-pickers";
import {
	type FieldPath,
	type FieldValues,
	type UseControllerProps,
	useController,
} from "react-hook-form";

type ControlledDateTimeProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<
	DateTimePickerFieldProps,
	"onChange" | "value" | "defaultValue" | "onBlur" | "error"
> &
	UseControllerProps<TFieldValues, TName> & {
		helperText?: string;
	};

export default function ControlledDateTime<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControlledDateTimeProps<TFieldValues, TName>) {
	const {
		control,
		name,
		rules,
		defaultValue,
		disabled,
		shouldUnregister,
		helperText,
		...rest
	} = props;

	const {
		field: { ref, ...restField },
		fieldState,
	} = useController({
		control,
		name,
		defaultValue,
		rules,
		disabled,
		shouldUnregister,
	});

	return (
		<DateTimePicker
			label="Checkin Time"
			slotProps={{
				textField: {
					error: fieldState.error !== undefined,
					helperText: fieldState.error?.message ?? helperText,
				},
			}}
			inputRef={ref}
			{...rest}
			{...restField}
		/>
	);
}
