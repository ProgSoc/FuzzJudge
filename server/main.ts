import app, { websocket } from "./impl/app.ts";

export default {
  fetch: app.fetch,
  websocket,
  port: 1989
}