import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVolunteers, getVolunteerById, updateVolunteerInDb, deleteVolunteerFromDb, cancelVolunteerInDb, type VolunteerData } from './supabase-service'

export const QUERY_KEYS = {
  VOLUNTEERS: "volunteers",
  VOLUNTEER: "volunteer",
} as const

// Hooks for fetching data
export function useVolunteers() {
  return useQuery({
    queryKey: [QUERY_KEYS.VOLUNTEERS],
    queryFn: getVolunteers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useVolunteer(saiConnectId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.VOLUNTEER, saiConnectId],
    queryFn: () => getVolunteerById(saiConnectId),
    enabled: !!saiConnectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Mutation hooks for updating data
export function useUpdateVolunteer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VolunteerData }) => updateVolunteerInDb(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VOLUNTEERS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VOLUNTEER, id] })
    },
  })
}

export function useDeleteVolunteer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteVolunteerFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VOLUNTEERS] })
    },
  })
}

export function useCancelVolunteer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelVolunteerInDb,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VOLUNTEERS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VOLUNTEER, id] })
    },
  })
} 