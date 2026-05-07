import { createFileRoute } from '@tanstack/react-router'
import { usersStore, generateVerificationCode } from '@/lib/server-auth'

export const Route = createFileRoute('/api/auth/resend')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { email: string }
        const { email } = body

        const users = usersStore()
        const user = (await users.get(`email:${email.toLowerCase()}`, { type: 'json' })) as any

        if (!user) {
          return Response.json({ error: 'User not found' }, { status: 404 })
        }
        if (user.verified) {
          return Response.json({ error: 'Account is already verified' }, { status: 400 })
        }

        const code = generateVerificationCode()
        const expiry = Date.now() + 24 * 60 * 60 * 1000
        await users.setJSON(`email:${email.toLowerCase()}`, {
          ...user,
          verificationCode: code,
          verificationExpiry: expiry,
        })

        return Response.json({
          success: true,
          verificationCode: code,
          message: `New verification code sent to ${email}`,
        })
      },
    },
  },
})
