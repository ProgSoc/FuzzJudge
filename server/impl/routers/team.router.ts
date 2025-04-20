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
  .post("/", async (c) => {
    const formData = await c.req.formData();

    const team = await createTeam(deleteFalsey(Object.fromEntries(formData.entries())) as any);
    return c.json(team, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        Location: `${c.req.url}/${team.id}`,
      },
    });
  })
  .patch("/:id", async (c) => {
    const formData = await c.req.formData();

    patchTeam(parseInt(c.req.param("id")), deleteFalsey(Object.fromEntries(formData.entries())) as any);
    return c.body(null, { status: 204 });
  })
  .delete("/:id", async (c) => {
    deleteTeam(parseInt(c.req.param("id")));
    return c.body(null, { status: 204 });
  })
  .use(
    "*",
    authMiddleware({
      roles: ["admin"],
      verifyUser: basicAuth,
    }),
  );
