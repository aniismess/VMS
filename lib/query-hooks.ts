import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVolunteers, getVolunteerById, updateVolunteerInDb, deleteVolunteerFromDb, cancelVolunteerInDb, type VolunteerData } from './supabase-service'

// Query keys
const volunteersKey = ["volunteers"] as const
const volunteerKey = (id: string) => ["volunteer", id] as const

// Hooks for fetching data
export function useVolunteers() {
  return useQuery({
    queryKey: volunteersKey,
    queryFn: getVolunteers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useVolunteer(id: string) {
  return useQuery({
    queryKey: volunteerKey(id),
    queryFn: () => getVolunteerById(id),
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
      queryClient.invalidateQueries({ queryKey: volunteersKey })
      queryClient.invalidateQueries({ queryKey: volunteerKey(id) })
    },
  })
}

export function useDeleteVolunteer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteVolunteerFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: volunteersKey })
    },
  })
}

export function useCancelVolunteer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelVolunteerInDb,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: volunteersKey })
      queryClient.invalidateQueries({ queryKey: volunteerKey(id) })
    },
  })
} 