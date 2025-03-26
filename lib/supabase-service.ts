import { supabase } from "./supabase"

export type RegisteredVolunteer = {
  sai_connect_id: string
  batch: string | null
  service_location: string | null
}

export type VolunteerData = {
  serial_number: string | null
  full_name: string | null
  age: number | null
  aadhar_number: string | null
  sai_connect_id: string
  sevadal_training_certificate: boolean
  mobile_number: string | null
  sss_district: string | null
  gender: string | null
  samiti_or_bhajan_mandli: string | null
  education: string | null
  special_qualifications: string | null
  past_prashanti_service: boolean
  last_service_location: string | null
  other_service_location: string | null
  prashanti_arrival: string | null
  prashanti_departure: string | null
  duty_point: string | null
  is_cancelled: boolean
  created_by_id: string | null
  registered_volunteers: RegisteredVolunteer | null
}

export async function getVolunteers(): Promise<VolunteerData[]> {
  const { data, error } = await supabase
    .from("volunteers_volunteers")
    .select(`
      *,
      registered_volunteers!left (
        sai_connect_id,
        batch,
        service_location
      )
    `)
    .order("sai_connect_id", { ascending: false })

  if (error) {
    console.error("Error fetching volunteers:", error)
    throw error
  }

  return data || []
}

export async function getVolunteerStats() {
  const [{ data: volunteers, error }, { count: registeredCount }] = await Promise.all([
    supabase.from("volunteers_volunteers").select("is_cancelled"),
    supabase.from("registered_volunteers").select("*", { count: 'exact' })
  ])

  if (error) {
    console.error("Error fetching volunteer stats:", error)
    return {
      totalVolunteers: 0,
      coming: 0,
      notComing: 0,
      registered: 0
    }
  }

  const totalVolunteers = volunteers?.length || 0
  const coming = volunteers?.filter((v) => !v.is_cancelled).length || 0
  const notComing = volunteers?.filter((v) => v.is_cancelled).length || 0

  return {
    totalVolunteers,
    coming,
    notComing,
    registered: registeredCount || 0
  }
}

export async function createVolunteerInDb(volunteer: VolunteerData) {
  const { data, error } = await supabase
    .from("volunteers_volunteers")
    .insert([volunteer])
    .select()

  if (error) {
    console.error("Error creating volunteer:", error)
    throw error
  }

  return data?.[0]
}

export async function updateVolunteerInDb(id: string, updates: Partial<VolunteerData>) {
  const { data, error } = await supabase.from("volunteers_volunteers").update(updates).eq("sai_connect_id", id).select()

  if (error) {
    console.error("Error updating volunteer:", error)
    throw error
  }

  return data?.[0]
}

export async function deleteVolunteerFromDb(id: string) {
  const { error } = await supabase.from("volunteers_volunteers").delete().eq("sai_connect_id", id)

  if (error) {
    console.error("Error deleting volunteer:", error)
    throw error
  }

  return true
}

export async function getVolunteerById(id: string): Promise<VolunteerData | null> {
  try {
    const { data, error } = await supabase
      .from("volunteers_volunteers")
      .select("*")
      .eq("sai_connect_id", id)
      .maybeSingle()

    if (error) {
      console.error("Error fetching volunteer:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching volunteer:", error)
    return null
  }
}

export async function cancelVolunteerInDb(id: string) {
  const { data, error } = await supabase
    .from("volunteers_volunteers")
    .update({ is_cancelled: true })
    .eq("sai_connect_id", id)
    .select()

  if (error) {
    console.error("Error canceling volunteer:", error)
    throw error
  }

  return data?.[0]
}

