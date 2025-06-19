import ControlledTextField from "@/components/ControlledTextField";
import useLoginMutation from "@/hooks/useLoginMutation";
import useZodForm, { type ZodSubmitHandler } from "@/hooks/useZodForm";
import { Button, Container, Divider, Stack, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/login")({
	beforeLoad: () => ({
		getTitle: () => "Login",
	}),
	component: RouteComponent,
});

const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

function RouteComponent() {
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useZodForm({
		schema: loginSchema,
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const loginMutation = useLoginMutation();

	const onSubmit: ZodSubmitHandler<typeof loginSchema> = async (data) => {
		await loginMutation.mutateAsync({
			username: data.username,
			password: data.password,
		});
	};

	return (
		<Container>
			<Stack component={"form"} onSubmit={handleSubmit(onSubmit)} spacing={2}>
				<Typography variant="h4" component="h1" gutterBottom>
					Login
				</Typography>
				<Divider />
				<ControlledTextField
					control={control}
					name="username"
					label="Username"
					required
					fullWidth
				/>
				<ControlledTextField
					control={control}
					name="password"
					label="Password"
					type="password"
					required
					fullWidth
				/>
				<Button type="submit" loading={isSubmitting}>
					Login
				</Button>
			</Stack>
		</Container>
	);
}
