import { createFileRoute } from '@tanstack/react-router'
import { attendanceStore, getSessionUser } from '@/lib/server-auth'

export const Route = createFileRoute('/api/attendance/$showId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const store = attendanceStore()
        const { blobs } = await store.list({ prefix: `attendance:${params.showId}/` })
        const attendees = (
          await Promise.all(blobs.map(({ key }) => store.get(key, { type: 'json' })))
        ).filter(Boolean)
        return Response.json({ attendees })
      },

      POST: async ({ request, params }) => {
        const user = await getSessionUser(request)
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        if (!user.verified) {
          return Response.json(
            { error: 'Email verification required to RSVP' },
            { status: 403 }
          )
        }

        const store = attendanceStore()
        const key = `attendance:${params.showId}/${user.userId}`
        const existing = await store.get(key)

        if (existing) {
          await store.delete(key)
          return Response.json({ attending: false })
        } else {
          await store.setJSON(key, {
            userId: user.userId,
            email: user.email,
            name: user.name,
            attendedAt: new Date().toISOString(),
          })
          return Response.json({ attending: true })
        }
      },
    },
  },
})
