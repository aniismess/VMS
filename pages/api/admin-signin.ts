import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body

    const { user, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    return res.status(200).json({ token: user?.id })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
