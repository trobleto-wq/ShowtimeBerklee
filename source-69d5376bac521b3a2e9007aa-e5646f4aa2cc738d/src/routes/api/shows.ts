import { createFileRoute } from '@tanstack/react-router'
import { showsStore, getSessionUser, generateId } from '@/lib/server-auth'

export const Route = createFileRoute('/api/shows')({
  server: {
    handlers: {
      GET: async () => {
        const shows = showsStore()
        const { blobs } = await shows.list({ prefix: 'show:' })

        const showList = (
          await Promise.all(
            blobs.map(async ({ key }) => {
              const show = (await shows.get(key, { type: 'json' })) as any
              if (!show) return null
              const { imageData: _img, ...rest } = show
              return { ...rest, hasImage: !!show.imageData }
            })
          )
        ).filter(Boolean) as any[]

        const now = new Date()
        const upcoming = showList
          .filter((s) => {
            const dt = new Date(`${s.date}T${s.time || '00:00'}`)
            return dt >= now
          })
          .sort((a, b) => {
            const da = new Date(`${a.date}T${a.time || '00:00'}`).getTime()
            const db = new Date(`${b.date}T${b.time || '00:00'}`).getTime()
            return da - db
          })

        return Response.json({ shows: upcoming })
      },

      POST: async ({ request }) => {
        const user = await getSessionUser(request)
        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        if (!user.verified) {
          return Response.json(
            { error: 'Email verification required before posting shows' },
            { status: 403 }
          )
        }

        const body = (await request.json()) as any
        const { title, date, time, venue, lineup, description, ticketLink, genre, category, imageData } =
          body

        if (!title || !date || !venue) {
          return Response.json(
            { error: 'Title, date, and venue are required' },
            { status: 400 }
          )
        }

        const id = generateId()
        const show = {
          id,
          title,
          date,
          time: time || '',
          venue,
          lineup: lineup || '',
          description: description || '',
          ticketLink: ticketLink || '',
          genre: genre || '',
          category: category || 'diy',
          imageData: imageData || null,
          createdBy: user.userId,
          createdByEmail: user.email,
          createdByName: user.name,
          createdAt: new Date().toISOString(),
        }

        await showsStore().setJSON(`show:${id}`, show)

        const { imageData: _img, ...rest } = show
        return Response.json({ show: { ...rest, hasImage: !!imageData } }, { status: 201 })
      },
    },
  },
})
