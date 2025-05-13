import { CloseCode, type ConnectionInitMessage } from "graphql-ws";
import { type ServerOptions, handleProtocols, makeServer } from "graphql-ws";
import type { Context, Env, Input } from "hono";
import { createMiddleware } from "hono/factory";
import type { UpgradeWebSocket, WSContext } from "hono/ws";

/**
 * The WeakKey type is used to define the key of the WebSocket.
 * This is used to store the WebSocket in a WeakMap.
 */
interface MakeHonoHooksOptions<T = unknown> {
	/**
	 * If true, the server will be in production mode. This will disable some debugging features.
	 */
	isProd?: boolean;
	/**
	 * The function to upgrade the WebSocket connection from Hono's websocket helper.
	 */
	upgradeWebSocket: UpgradeWebSocket<T>;
}

/**
 * The Client interface is used to define the methods that a client must implement.
 */
interface Client {
	/**
	 * Clients may send messages through the socket. This function can be called to handle those incoming messages.
	 */
	handleIncomingMessage: (data: string) => Promise<void>;
	/**
	 * When a clients socket is closed, the graphql server wants to be notified. This function can be called to do that.
	 */
	signalClosure: (code: number, reason: string) => Promise<void>;
}

/**
 * The Extra interface is used to define the extra properties that are passed to the server.
 * This is used to pass the Hono context to the server.
 */

interface Extra<
	T,
	// biome-ignore lint/suspicious/noExplicitAny: These are the types of the Hono context
	E extends Env = any,
	// biome-ignore lint/suspicious/noExplicitAny: These are the types of the Hono context
	P extends string = any,
	// biome-ignore lint/complexity/noBannedTypes: These are the types of the Hono context
	I extends Input = {},
> {
	/**
	 * The context of the request. This is the same as the context of the Hono app.
	 */
	c: Context<E, P, I>;
	/**
	 * The websocket context.
	 */
	ws: WSContext<T>;
}

function limitCloseReason(reason: string, whenTooLong: string) {
	return reason.length < 124 ? reason : whenTooLong;
}

export function makeWebsocketGraphQLMiddleware<
	/** The Websocket Type */
	T extends WeakKey = WeakKey,
	// biome-ignore lint/suspicious/noExplicitAny: These are the types of the Hono context
	HE extends Env = any,
	// biome-ignore lint/suspicious/noExplicitAny: These are the types of the Hono context
	HP extends string = any,
	// biome-ignore lint/complexity/noBannedTypes: These are the types of the Hono context
	I extends Input = {},
	P extends ConnectionInitMessage["payload"] = ConnectionInitMessage["payload"],
	E extends Record<PropertyKey, unknown> = Record<PropertyKey, never>,
>(
	options: ServerOptions<P, Extra<T, HE, HP, I> & Partial<E>> &
		MakeHonoHooksOptions<T>,
) {
	const isProd =
		typeof options.isProd === "boolean"
			? options.isProd
			: process.env.NODE_ENV === "production";

	const { upgradeWebSocket } = options;

	const server = makeServer<P, Extra<T, HE, HP, I> & Partial<E>>(options); // Make a graphql-ws server

	const clients = new WeakMap<T, Client>(); // WeakMap to store the clients (the WebSocket connections)

	return createMiddleware<HE, HP, I>(async (c, next) => {
		if (c.req.header("upgrade") !== "websocket") {
			// Check if the request is a WebSocket upgrade request, otherwise continue
			return next();
		}

		return upgradeWebSocket(c, {
			onOpen: (_, ws) => {
				const { raw: rawWs } = ws;
				if (!rawWs) throw new Error("No raw socket found");
				const client: Client = {
					handleIncomingMessage: () => {
						throw new Error("Message received before handler was registered");
					},
					signalClosure: () => {
						throw new Error("Closed before handler was registered");
					},
				};
				client.signalClosure = server.opened(
					{
						protocol:
							handleProtocols(c.req.header("sec-websocket-protocol") ?? "") ||
							"",

						send: async (message) => {
							// ws might have been destroyed in the meantime, send only if exists
							if (clients.has(rawWs)) {
								ws.send(message);
							}
						},
						close: (code, reason) => {
							if (clients.has(rawWs)) {
								ws.close(code, reason);
							}
						},
						onMessage: (cb) => {
							client.handleIncomingMessage = cb;
						},
					},
					{ ws, c } as Extra<T, HE, HP, I> & Partial<E>,
				);

				clients.set(rawWs, client);
			},
			onMessage: async (evt, ws) => {
				if (!ws.raw) throw new Error("No raw socket found");
				const client = clients.get(ws.raw);
				if (!client) throw new Error("Message received for a missing client");

				try {
					await client.handleIncomingMessage(evt.data.toString());
				} catch (err) {
					console.error(
						"Internal error occurred during message handling. " +
							"Please check your implementation.",
						err,
					);
					ws.close(
						CloseCode.InternalServerError,
						isProd
							? "Internal server error"
							: limitCloseReason(
									err instanceof Error ? err.message : String(err),
									"Internal server error",
								),
					);
				}
			},
			onClose: async (evt, ws) => {
				if (!ws.raw) throw new Error("No raw socket found");
				const client = clients.get(ws.raw);
				if (!client) throw new Error("Closing a missing client");

				client.signalClosure(
					evt.code ?? 1000,
					evt.reason || "Connection closed",
				);
				clients.delete(ws.raw);
			},
			onError: (_, ws) => {
				console.error(
					"Internal error emitted on the WebSocket socket. " +
						"Please check your implementation.",
				);
				ws.close(CloseCode.InternalServerError, "Internal server error");
			},
		});
	});
}
