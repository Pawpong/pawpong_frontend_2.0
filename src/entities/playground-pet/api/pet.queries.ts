import { getPetConfig } from './pet.api'

export const petConfigOptions = {
  queryKey: ['playground-pet', 'config'],
  queryFn: ({ signal }: { signal: AbortSignal }) => getPetConfig(signal),
  staleTime: 30_000,
  refetchInterval: 30_000,
  refetchOnWindowFocus: true,
  retry: false,
  throwOnError: false,
} as const
