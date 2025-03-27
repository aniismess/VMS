import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('Sign in error:', error)
      return new NextResponse(
        JSON.stringify({ error: error.message }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!data?.user) {
      console.error('No user data returned from Supabase')
      return new NextResponse(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Don't send sensitive user data in the response
    return new NextResponse(
      JSON.stringify({ 
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Sign in error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 