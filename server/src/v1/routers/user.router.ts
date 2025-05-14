import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import {
	authMiddleware,
	forbiddenResponse,
	unauthorizedResponse,
} from "../../middleware/auth.middleware";
import { basicAuth } from "../../services/auth.service";
import {
	allUsers,
	deleteUser,
	patchUser,
	resetUser,
} from "../../services/user.service";
import { UserRoleSchema, UserSchema } from "../schema/user.schema";

const UserParamSchema = z
	.object({
		id: z.coerce.number().openapi({
			param: {
				in: "path",
				name: "id",
			},
		}),
	})
	.openapi("UserParam");

const userRouter = new OpenAPIHono();
userRouter.openapi(
	createRoute({
		tags: ["Users"],
		path: "/",
		method: "get",
		middleware: authMiddleware({
			roles: ["admin"],
			verifyUser: basicAuth,
		}),
		security: [
			{
				Bearer: [],
			},
		],
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(UserSchema),
					},
				},
				description: "All users",
			},
			401: unauthorizedResponse,
			403: forbiddenResponse,
		},
		operationId: "getAllUsers",
	}),
	async (c) => {
		const allUsersList = await allUsers();
		return c.json(allUsersList, {
			status: 200,
		});
	},
);
userRouter.openapi(
	createRoute({
		tags: ["Users"],
		path: "/",
		method: "post",
		middleware: authMiddleware({
			roles: ["admin"],
			verifyUser: basicAuth,
		}),
		security: [
			{
				Bearer: [],
			},
		],
		request: {
			body: {
				content: {
					"application/x-www-form-urlencoded": {
						schema: z.object({
							logn: z.string(),
							role: UserRoleSchema,
						}),
					},
				},
			},
		},
		responses: {
			201: {
				content: {
					"application/json": {
						schema: UserSchema,
					},
				},
				description: "Successfully created user",
			},
			401: unauthorizedResponse,
			403: forbiddenResponse,
		},
		operationId: "createUser",
	}),
	async (c) => {
		const formData = await c.req.valid("form");

		const user = await resetUser(formData);
		return c.json(user, {
			status: 201,
			headers: {
				"Content-Type": "application/json",
				Location: `${c.req.url}/${user.id}`,
			},
		});
	},
);
userRouter.openapi(
	createRoute({
		method: "patch",
		path: "/{id}",
		request: {
			params: UserParamSchema,
			body: {
				content: {
					"application/x-www-form-urlencoded": {
						schema: z.object({
							logn: z.string().optional(),
							role: UserRoleSchema.optional(),
							team: z.number().optional(),
							name: z.string().optional(),
						}),
					},
				},
			},
		},
		tags: ["Users"],
		middleware: authMiddleware({
			roles: ["admin"],
			verifyUser: basicAuth,
		}),
		security: [
			{
				Bearer: [],
			},
		],
		responses: {
			204: {
				description: "User updated",
			},
			401: unauthorizedResponse,
			403: forbiddenResponse,
		},
		operationId: "updateUser",
	}),
	async (c) => {
		const formData = await c.req.valid("form");
		console.log({ formData });
		const { id } = c.req.valid("param");

		await patchUser(id, formData);
		return c.body(null, { status: 204 });
	},
);
userRouter.openapi(
	createRoute({
		path: "/{id}",
		method: "delete",
		request: {
			params: UserParamSchema,
		},
		tags: ["Users"],
		middleware: authMiddleware({
			roles: ["admin"],
			verifyUser: basicAuth,
		}),
		security: [
			{
				Bearer: [],
			},
		],
		responses: {
			204: {
				description: "User deleted",
			},
			401: unauthorizedResponse,
			403: forbiddenResponse,
		},
		operationId: "deleteUser",
	}),
	async (c) => {
		const { id } = c.req.valid("param");
		await deleteUser(id);
		return c.body(null, { status: 204 });
	},
);

export { userRouter };
