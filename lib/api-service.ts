const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

type Volunteer = {
  id: number
  name: string
  status: string
  details: string
}

type DashboardData = {
  volunteers: Volunteer[]
  stats: {
    totalVolunteers: number
    coming: number
    notComing: number
  }
}

// Helper function to safely parse JSON
async function safeJsonParse(response: Response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error("Error parsing JSON:", e)
    console.log("Response text:", text)
    throw new Error(`Failed to parse JSON response: ${text}`)
  }
}

export async function getAvailablePaths(): Promise<string[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${API_BASE_URL}/`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await safeJsonParse(response)
    return data.available_paths
  } catch (error) {
    console.error("Error fetching available paths:", error)
    return []
  }
}

export async function adminSignIn(email: string, password: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    console.log("Attempting to sign in with email:", email)
    const response = await fetch(`${API_BASE_URL}/admin-signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await safeJsonParse(response)
    console.log("Successfully signed in:", data)
    return data.token
  } catch (error) {
    console.error("Error signing in:", error)
    return null
  }
}

export async function getDashboardData(token: string): Promise<DashboardData> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${API_BASE_URL}/admin-dashboard`, {
      headers: {
        "X-Admin-Token": token,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await safeJsonParse(response)

    // The API returns an array of volunteers and stats object
    // We need to restructure it to match our expected format
    if (Array.isArray(data)) {
      return {
        volunteers: data,
        stats: {
          totalVolunteers: 0,
          coming: 0,
          notComing: 0,
        },
      }
    } else {
      return {
        volunteers: [],
        stats: {
          totalVolunteers: data.totalVolunteers || 0,
          coming: data.coming || 0,
          notComing: data.notComing || 0,
        },
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      volunteers: [],
      stats: {
        totalVolunteers: 0,
        coming: 0,
        notComing: 0,
      },
    }
  }
}

export async function createVolunteer(token: string, name: string, details: string): Promise<Volunteer | null> {
  try {
    const url = new URL(`${API_BASE_URL}/admin-create-volunteer`)
    url.searchParams.append("volunteer-name", name)
    url.searchParams.append("volunteer-details", details)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(url.toString(), {
      headers: {
        "X-Admin-Token": token,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await safeJsonParse(response)
  } catch (error) {
    console.error("Error creating volunteer:", error)
    return null
  }
}

export async function updateVolunteer(
  token: string,
  id: number,
  data: { name?: string; status?: string; details?: string },
): Promise<Volunteer | null> {
  try {
    const url = new URL(`${API_BASE_URL}/admin-update-volunteer`)
    url.searchParams.append("sai_connect_id", id.toString())

    if (data.name) url.searchParams.append("volunteer-name", data.name)
    if (data.status) url.searchParams.append("status", data.status)
    if (data.details) url.searchParams.append("volunteer-details", data.details)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(url.toString(), {
      headers: {
        "X-Admin-Token": token,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await safeJsonParse(response)
  } catch (error) {
    console.error("Error updating volunteer:", error)
    return null
  }
}

export async function deleteVolunteer(token: string, id: number): Promise<Volunteer | null> {
  try {
    const url = new URL(`${API_BASE_URL}/admin-delete-volunteer`)
    url.searchParams.append("sai_connect_id", id.toString())

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(url.toString(), {
      headers: {
        "X-Admin-Token": token,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await safeJsonParse(response)
  } catch (error) {
    console.error("Error deleting volunteer:", error)
    return null
  }
}

export async function cancelVolunteer(token: string, id: number): Promise<Volunteer | null> {
  try {
    const url = new URL(`${API_BASE_URL}/admin-cancel-volunteer`)
    url.searchParams.append("sai_connect_id", id.toString())

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(url.toString(), {
      headers: {
        "X-Admin-Token": token,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await safeJsonParse(response)
  } catch (error) {
    console.error("Error canceling volunteer:", error)
    return null
  }
}

