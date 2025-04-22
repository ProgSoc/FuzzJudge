import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { allTeams, createTeam, deleteTeam, patchTeam, TeamSchema } from "../services/team.service";
import { deleteFalsey } from "../util";
import { authMiddleware, forbiddenResponse, unauthorizedResponse } from "../middleware/auth.middleware";
import { basicAuth } from "../services/auth.service";

export const teamRouter = new OpenAPIHono()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.array(TeamSchema),
            },
          },
          description: "All teams",
        },
        401: unauthorizedResponse,
        403: forbiddenResponse,
      },
      middleware: authMiddleware({
        roles: ["admin"],
        verifyUser: basicAuth,
      }),
      security: [
        {
          Bearer: [],
        },
      ],
      tags: ["Team"],
    }),
    async (c) => {
      const allteamList = await allTeams();
      return c.json(allteamList, {
        status: 200,
      });
    },
  )
  .openapi(
    createRoute({
      tags: ["Team"],
      method: "post",
      path: "/",
      request: {
        body: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: z.object({
                name: z.string().min(1),
              }),
            },
          },
        },
      },
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
        201: {
          content: {
            "application/json": {
              schema: TeamSchema,
            },
          },
          description: "Created team",
        },
        401: unauthorizedResponse,
        403: forbiddenResponse,
      },
    }),
    async (c) => {
      const formData = await c.req.valid("form");

      const team = await createTeam(formData);
      return c.json(team, {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          Location: `${c.req.url}/${team.id}`,
        },
      });
    },
  )
  .openapi(
    createRoute({
      path: "/{id}",
      method: "patch",
      tags: ["Team"],
      request: {
        body: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: z.object({
                name: z.string().min(1),
              }),
            },
          },
        },
        params: z.object({
          id: z.coerce.number().openapi({
            param: {
              in: "path",
              name: "id",
            },
          }),
        }),
      },
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
          description: "Created team",
        },
        401: unauthorizedResponse,
        403: forbiddenResponse,
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const formData = await c.req.valid("form");

      await patchTeam(id, formData);
      return c.body(null, 204);
    },
  )
  .openapi(
    createRoute({
      method: "delete",
      path: "/{id}",
      tags: ["Team"],
      request: {
        params: z.object({
          id: z.coerce.number().openapi({
            param: {
              in: "path",
              name: "id",
            },
          }),
        }),
      },
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
          description: "Deleted team",
        },
        401: unauthorizedResponse,
        403: forbiddenResponse,
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      await deleteTeam(id);
      return c.body(null, { status: 204 });
    },
  )