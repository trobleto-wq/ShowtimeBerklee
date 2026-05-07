import { createFileRoute } from '@tanstack/react-router'
import { sessionsStore } from '@/lib/server-auth'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get('Authorization')
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.slice(7)
          await sessionsStore().delete(`session:${token}`)
        }
        return Response.json({ success: true })
      },
    },
  },
})
