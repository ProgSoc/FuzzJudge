import { useQuery, type QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { AppShell, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { AppType } from 'server/mod';
import { hc} from 'hono/client'
import { competitionQueryOptions } from 'src/queryOptions/compeition';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient,
  client: ReturnType<typeof hc<AppType>>
}>()({
  component: () => {
    const competitionName = useQuery(competitionQueryOptions.name())
    const problems = useQuery(competitionQueryOptions.problems())

    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] =
    useDisclosure(true);
    return <>
      <AppShell
       padding="md"
       header={{ height: 60 }}
       navbar={{
         width: 300,
         breakpoint: 'sm',
         collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
       }}
    >
      <AppShell.Header>
        {competitionName.data ? <code>{competitionName.data}</code> : <code>Loading...</code>}
      </AppShell.Header>

      <AppShell.Navbar>
       {problems.data ? <code>{problems.data}</code> : <code>Loading...</code>}
      </AppShell.Navbar>

      <AppShell.Main>
      <Button onClick={toggleDesktop} visibleFrom="sm">
          Toggle navbar
        </Button>
        <Button onClick={toggleMobile} hiddenFrom="sm">
          Toggle navbar
        </Button><Outlet /></AppShell.Main>
    </AppShell>
      <TanStackRouterDevtools />
    </>
  }
})


