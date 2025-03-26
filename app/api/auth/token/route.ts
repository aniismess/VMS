import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // For development, return a dummy token
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ token: 'development-token' })
    }

    // For production, use the actual API
    const response = await fetch("http://localhost:8000/api/admin-signin", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin',
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error:", errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching API token:", error)
    // Return a development token in case of error
    return NextResponse.json({ token: 'development-token' })
  }
} 