import app from "./impl/app.ts";
import { websocket } from "./impl/websocket.ts";

export default {
  fetch: app.fetch,
  websocket,
  port: 1989
}
