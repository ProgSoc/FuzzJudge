import CompetitionHeader from "@/components/CompetitionHeader";
import { MantineNavLink } from "@/components/MantineNavLink";
import ProblemSection from "@/components/ProblemSection";
import { AppShell, Burger, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
	component: App,
});

function App() {
	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: 300,
				breakpoint: "sm",
			}}
			padding="md"
		>
			<CompetitionHeader />

			<AppShell.Navbar>
				<AppShell.Section>
					<MantineNavLink
						to="/"
						activeProps={{
							active: true,
						}}
						label={"Competition Info"}
					/>
				</AppShell.Section>
				<ProblemSection />
				{/* Admin */}
				<AppShell.Section>
					<MantineNavLink
						to="/admin"
						activeProps={{
							active: true,
						}}
						label={"Admin"}
					/>
				</AppShell.Section>
			</AppShell.Navbar>

			<AppShell.Main>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	);
}
