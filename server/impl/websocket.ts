import { ServerWebSocket } from 'bun';
import { createBunWebSocket } from 'hono/bun';

export const { websocket, upgradeWebSocket } = createBunWebSocket<ServerWebSocket>();
