import { queryOptions } from "@tanstack/react-query"
import { hc } from "hono/client"
import type { AppType } from "server/mod"

const client = hc<AppType>(import.meta.env.VITE_BACKEND_URL)

export const competitionQueryKeys = {
    all: () => ['competition'] as const,
    name: () => [...competitionQueryKeys.all(), 'name'] as const,
    problems: () => [...competitionQueryKeys.all(), 'problems'] as const,
}

export const competitionQueryOptions = {
    name: () => queryOptions({
        queryFn: () => client.comp.name.$get().then((res) => res.text()),
        queryKey: competitionQueryKeys.name(),
    }),
    problems: () => queryOptions({
        queryFn: () => client.comp.prob.$get().then((res) => res.text()),
        queryKey: competitionQueryKeys.problems(),
    }),
}