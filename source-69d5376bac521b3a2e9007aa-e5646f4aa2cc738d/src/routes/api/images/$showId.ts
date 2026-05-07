import { createFileRoute } from '@tanstack/react-router'
import { showsStore } from '@/lib/server-auth'

export const Route = createFileRoute('/api/images/$showId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const show = (await showsStore().get(`show:${params.showId}`, { type: 'json' })) as any
        if (!show?.imageData) {
          return new Response(null, { status: 404 })
        }

        const matches = (show.imageData as string).match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          return new Response(null, { status: 400 })
        }

        const contentType = matches[1]
        const buffer = Buffer.from(matches[2], 'base64')

        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})
