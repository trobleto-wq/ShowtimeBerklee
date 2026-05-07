import { createFileRoute } from '@tanstack/react-router'
import { usersStore, sessionsStore, verifyPassword, generateToken } from '@/lib/server-auth'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { email: string; password: string }
        const { email, password } = body

        const users = usersStore()
        const user = (await users.get(`email:${email.toLowerCase()}`, { type: 'json' })) as any

        if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
          return Response.json({ error: 'Invalid email or password' }, { status: 401 })
        }

        const token = generateToken()
        const sessions = sessionsStore()

        await sessions.setJSON(`session:${token}`, {
          userId: user.id,
          email: user.email,
          name: user.name,
          verified: user.verified,
          createdAt: new Date().toISOString(),
        })

        return Response.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            verified: user.verified,
          },
        })
      },
    },
  },
})
