import useRegisterMutation from "@/hooks/useRegisterMutation";
import useZodForm from "@/hooks/useZodForm";
import {
	Button,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
} from "@mui/material";
import { z } from "zod";
import ControlledTextField from "./ControlledTextField";

type RegisterDialogProps = { onClose: () => void; open: boolean };

const registerSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		username: z.string().min(1, "Username is required"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z
			.string()
			.min(6, "Password must be at least 6 characters"),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			ctx.addIssue({
				path: ["confirmPassword"],
				code: z.ZodIssueCode.custom,
				message: "Passwords do not match",
			});
		}
	});

export default function RegisterDialog(props: RegisterDialogProps) {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
		reset,
	} = useZodForm({
		schema: registerSchema,
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const registerMutation = useRegisterMutation();

	const onSubmit = async (data: z.infer<typeof registerSchema>) => {
		await registerMutation.mutateAsync({
			name: data.name,
			username: data.username,
			password: data.password,
		});
		reset({
			username: "",
			password: "",
			confirmPassword: "",
			name: "",
		});
		props.onClose();
	};

	return (
		<Dialog
			{...props}
			maxWidth="md"
			component={"form"}
			onSubmit={handleSubmit(onSubmit)}
		>
			<DialogTitle>Register</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Register to create a new account. Please enter your name, username,
					and password.
				</DialogContentText>
				<Stack gap={2} mt={2}>
					<ControlledTextField
						control={control}
						name="name"
						label="Name"
						variant="outlined"
						fullWidth
						required
					/>
					<ControlledTextField
						control={control}
						name="username"
						label="Username"
						variant="outlined"
						fullWidth
						required
					/>
					<ControlledTextField
						control={control}
						name="password"
						label="Password"
						variant="outlined"
						fullWidth
						required
						type="password"
					/>
					<ControlledTextField
						control={control}
						name="confirmPassword"
						label="Confirm Password"
						variant="outlined"
						fullWidth
						required
						type="password"
					/>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						loading={isSubmitting}
					>
						Register
					</Button>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
