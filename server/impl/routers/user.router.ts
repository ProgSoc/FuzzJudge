import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import {
	authMiddleware,
	forbiddenResponse,
	unauthorizedResponse,
} from "../middleware/auth.middleware";
import { basicAuth } from "../services/auth.service";
import {
	UserSchema,
	allUsers,
	deleteUser,
	patchUser,
	resetUser,
} from "../services/user.service";
import { deleteFalsey } from "../util";

export const userRouter = new OpenAPIHono()
	.openapi(
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
		}),
		async (c) => {
			const allUsersList = await allUsers();
			return c.json(allUsersList, {
				status: 200,
			});
		},
	)
	.openapi(
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
								role: z.enum(["admin", "competitor"]),
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
	)
	.openapi(
		createRoute({
			method: "patch",
			path: "/{id}",
			request: {
				params: z.object({
					id: z.string().openapi({
						param: {
							in: "path",
							name: "id",
						},
					}),
				}),
				body: {
					content: {
						"application/x-www-form-urlencoded": {
							schema: z.object({
								logn: z.string().optional(),
								role: z.enum(["admin", "competitor"]).optional(),
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
		}),
		async (c) => {
			const formData = await c.req.valid("form");

			await patchUser(Number.parseInt(c.req.param("id")), formData);
			return c.body(null, { status: 204 });
		},
	)
	.openapi(
		createRoute({
			path: "/{id}",
			method: "delete",
			request: {
				params: z.object({
					id: z.string().openapi({
						param: {
							in: "path",
							name: "id",
						},
					}),
				}),
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
		}),
		async (c) => {
			await deleteUser(Number.parseInt(c.req.param("id")));
			return c.body(null, { status: 204 });
		},
	);
