import { createFileRoute } from '@tanstack/react-router'
import { getSessionUser } from '@/lib/server-auth'

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request)
        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return Response.json({ user })
      },
    },
  },
})
