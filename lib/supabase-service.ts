import { supabase } from "./supabase"

export type VolunteerData = {
  sai_connect_id: string
  serial_number?: string
  full_name: string
  age?: number
  aadhar_number?: string
  sevadal_training_certificate: boolean
  mobile_number?: string
  sss_district?: string
  samiti_or_bhajan_mandli?: string
  education?: string
  special_qualifications?: string
  past_prashanti_service: boolean
  last_service_location?: string
  other_service_location?: string
  prashanti_arrival?: string
  prashanti_departure?: string
  duty_point?: string
  is_cancelled?: boolean
  created_by_id?: number
}

export async function getVolunteers(): Promise<VolunteerData[]> {
  const { data, error } = await supabase
    .from("volunteers_volunteers")
    .select("*")
    .order("sai_connect_id", { ascending: false })

  if (error) {
    console.error("Error fetching volunteers:", error)
    throw error
  }

  return data || []
}

export async function getVolunteerStats() {
  const { data, error } = await supabase.from("volunteers_volunteers").select("is_cancelled")

  if (error) {
    console.error("Error fetching volunteer stats:", error)
    return {
      totalVolunteers: 0,
      coming: 0,
      notComing: 0,
    }
  }

  const totalVolunteers = data.length
  const coming = data.filter((v) => v.is_cancelled !== true).length
  const notComing = data.filter((v) => v.is_cancelled === true).length

  return {
    totalVolunteers,
    coming,
    notComing,
  }
}

export async function createVolunteerInDb(volunteer: Omit<VolunteerData, "sai_connect_id">) {
  const { data, error } = await supabase.from("volunteers_volunteers").insert([volunteer]).select()

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

