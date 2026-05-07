import { createFileRoute } from '@tanstack/react-router'
import { usersStore, sessionsStore } from '@/lib/server-auth'

export const Route = createFileRoute('/api/auth/verify')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { email: string; code: string }
        const { email, code } = body

        const users = usersStore()
        const user = (await users.get(`email:${email.toLowerCase()}`, { type: 'json' })) as any

        if (!user) {
          return Response.json({ error: 'User not found' }, { status: 404 })
        }
        if (user.verified) {
          return Response.json({ success: true, message: 'Already verified' })
        }
        if (Date.now() > user.verificationExpiry) {
          return Response.json(
            { error: 'Verification code has expired. Please request a new one.' },
            { status: 400 }
          )
        }
        if (user.verificationCode !== code) {
          return Response.json({ error: 'Incorrect verification code' }, { status: 400 })
        }

        user.verified = true
        user.verificationCode = null
        await users.setJSON(`email:${email.toLowerCase()}`, user)

        // Update all sessions for this user
        const sessions = sessionsStore()
        const { blobs } = await sessions.list({ prefix: 'session:' })
        await Promise.all(
          blobs.map(async ({ key }) => {
            const session = (await sessions.get(key, { type: 'json' })) as any
            if (session?.email === email.toLowerCase()) {
              await sessions.setJSON(key, { ...session, verified: true })
            }
          })
        )

        return Response.json({ success: true })
      },
    },
  },
})
