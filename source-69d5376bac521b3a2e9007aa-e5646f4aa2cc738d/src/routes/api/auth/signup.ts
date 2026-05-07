import { createFileRoute } from '@tanstack/react-router'
import {
  usersStore,
  hashPassword,
  generateId,
  generateVerificationCode,
} from '@/lib/server-auth'

export const Route = createFileRoute('/api/auth/signup')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          email: string
          password: string
          name: string
        }
        const { email, password, name } = body

        if (!email || !password || !name) {
          return Response.json({ error: 'All fields are required' }, { status: 400 })
        }
        if (password.length < 8) {
          return Response.json(
            { error: 'Password must be at least 8 characters' },
            { status: 400 }
          )
        }

        const users = usersStore()
        const existing = await users.get(`email:${email.toLowerCase()}`, { type: 'json' })
        if (existing) {
          return Response.json({ error: 'An account with this email already exists' }, { status: 409 })
        }

        const { hash, salt } = hashPassword(password)
        const id = generateId()
        const code = generateVerificationCode()
        const expiry = Date.now() + 24 * 60 * 60 * 1000

        await users.setJSON(`email:${email.toLowerCase()}`, {
          id,
          email: email.toLowerCase(),
          name,
          passwordHash: hash,
          passwordSalt: salt,
          verified: false,
          verificationCode: code,
          verificationExpiry: expiry,
          createdAt: new Date().toISOString(),
        })

        return Response.json({
          success: true,
          userId: id,
          verificationCode: code,
          message: `Verification code sent to ${email}`,
        })
      },
    },
  },
})
