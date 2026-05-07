import { createFileRoute } from '@tanstack/react-router'
import { showsStore, getSessionUser } from '@/lib/server-auth'

export const Route = createFileRoute('/api/shows/$showId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const show = (await showsStore().get(`show:${params.showId}`, { type: 'json' })) as any
        if (!show) {
          return Response.json({ error: 'Show not found' }, { status: 404 })
        }
        return Response.json({ show })
      },

      PUT: async ({ request, params }) => {
        const user = await getSessionUser(request)
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

        const shows = showsStore()
        const show = (await shows.get(`show:${params.showId}`, { type: 'json' })) as any
        if (!show) return Response.json({ error: 'Show not found' }, { status: 404 })
        if (show.createdBy !== user.userId) {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = (await request.json()) as any
        const updated = {
          ...show,
          ...body,
          id: show.id,
          createdBy: show.createdBy,
          createdByEmail: show.createdByEmail,
          createdByName: show.createdByName,
          createdAt: show.createdAt,
        }
        await shows.setJSON(`show:${params.showId}`, updated)
        return Response.json({ show: updated })
      },

      DELETE: async ({ request, params }) => {
        const user = await getSessionUser(request)
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

        const shows = showsStore()
        const show = (await shows.get(`show:${params.showId}`, { type: 'json' })) as any
        if (!show) return Response.json({ error: 'Show not found' }, { status: 404 })
        if (show.createdBy !== user.userId) {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        await shows.delete(`show:${params.showId}`)
        return new Response(null, { status: 204 })
      },
    },
  },
})
