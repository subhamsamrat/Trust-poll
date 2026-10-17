import { useQuery } from "@tanstack/react-query"


export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}