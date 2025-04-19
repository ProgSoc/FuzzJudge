import { OpenAPIHono } from "@hono/zod-openapi";
import { allUsers, deleteUser, patchUser, resetUser } from "../services/user.service";
import { deleteFalsey } from "../util";
import { authMiddleware } from "../middleware/auth.middleware";
import { basicAuth } from "../services/auth.service";

export const userRouter = new OpenAPIHono()
  .use(
    "*",
    authMiddleware({
      roles: ["admin"],
      verifyUser: basicAuth,
    }),
  )
  .get("/", async (c) => {
    return c.json(allUsers());
  })
  .post("/", async (c) => {
    const formData = await c.req.formData();

    const user = await resetUser(deleteFalsey(Object.fromEntries(formData.entries())) as any);
    return c.json(user, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        Location: `${c.req.url}/${user.id}`,
      },
    });
  })
  .patch("/:id", async (c) => {
    const formData = await c.req.formData();

    await patchUser(parseInt(c.req.param("id")), deleteFalsey(Object.fromEntries(formData.entries())) as any);
    return c.body(null, { status: 204 });
  })
  .delete("/:id", async (c) => {
    await deleteUser(parseInt(c.req.param("id")));
    return c.body(null, { status: 204 });
  });
