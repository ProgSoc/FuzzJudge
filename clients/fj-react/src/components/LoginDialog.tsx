import useLoginMutation from "@/hooks/useLoginMutation";
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

type LoginDialogProps = { onClose: () => void; open: boolean };

const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginDialog(props: LoginDialogProps) {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
		reset,
	} = useZodForm({
		schema: loginSchema,
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const loginMutation = useLoginMutation();

	const onSubmit = async (data: z.infer<typeof loginSchema>) => {
		await loginMutation.mutateAsync({
			username: data.username,
			password: data.password,
		});

		reset({
			username: "",
			password: "",
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
			<DialogTitle>Login</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Log in to access your account. Please enter your username and
					password.
				</DialogContentText>
				<Stack gap={2} mt={2}>
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
					<Button
						type="submit"
						variant="contained"
						color="primary"
						loading={isSubmitting}
					>
						Login
					</Button>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
