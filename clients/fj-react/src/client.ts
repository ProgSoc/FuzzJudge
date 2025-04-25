import { hc } from "server/v2/client";
import { env } from "./env";

export const client = hc(env.VITE_SERVER_URL);
