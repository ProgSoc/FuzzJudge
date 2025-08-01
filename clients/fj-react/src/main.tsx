import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./main.css";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/Toaster";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
	basepath: import.meta.env.BASE_URL,
	routeTree,
	context: {
		queryClient,
		getTitle: () => "Home",
	},
	defaultPreload: "intent",
	// Since we're using React Query, we don't want loader calls to ever be stale
	// This will ensure that the loader is always called when the route is preloaded or visited
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
});

const theme = createTheme({
	colorSchemes: {
		light: true,
		dark: true,
	},
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
// biome-ignore lint/style/noNonNullAssertion: Just one time check
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider theme={theme}>
					<LocalizationProvider
						dateAdapter={AdapterLuxon}
						adapterLocale="en-au"
					>
						<RouterProvider router={router} />
						<Toaster />
						<CssBaseline />
					</LocalizationProvider>
				</ThemeProvider>
			</QueryClientProvider>
		</StrictMode>,
	);
}
