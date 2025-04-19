import { OpenAPIHono } from "@hono/zod-openapi";
import { allTeams, createTeam, deleteTeam, patchTeam } from "../services/team.service";
import { deleteFalsey } from "../util";
import { authMiddleware } from "../middleware/auth.middleware";
import { basicAuth } from "../services/auth.service";

export const teamRouter = new OpenAPIHono()
  .use(
    "*",
    authMiddleware({
      roles: ["admin"],
      verifyUser: basicAuth,
    }),
  )
  .get("/", async (c) => {
    return c.json(allTeams());
  })
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
  });
