import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface Show {
  id: string
  title: string
  date: string
  time: string
  venue: string
  lineup: string
  description: string
  ticketLink: string
  genre: string
  category: 'diy' | 'berklee'
  imageData: string | null
  createdBy: string
  createdByName: string
  createdByEmail: string
  createdAt: string
}

interface Attendee {
  userId: string
  email: string
  name: string
  attendedAt: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export const Route = createFileRoute('/shows/$showId')({
  component: ShowDetailPage,
})

function ShowDetailPage() {
  const { showId } = Route.useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [show, setShow] = useState<Show | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [attending, setAttending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchShow()
    fetchAttendees()
  }, [showId])

  async function fetchShow() {
    try {
      const res = await fetch(`/api/shows/${showId}`)
      if (res.status === 404) { setNotFound(true); return }
      const data = await res.json()
      if (data.show) setShow(data.show)
      else setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAttendees() {
    try {
      const res = await fetch(`/api/attendance/${showId}`)
      const data = await res.json()
      const list: Attendee[] = data.attendees || []
      setAttendees(list)
      if (user) {
        setAttending(list.some((a) => a.userId === user.id))
      }
    } catch {}
  }

  async function handleRSVP() {
    if (!token) return
    setRsvpLoading(true)
    try {
      const res = await fetch(`/api/attendance/${showId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setAttending(data.attending)
      fetchAttendees()
    } finally {
      setRsvpLoading(false)
    }
  }

  async function handleDelete() {
    if (!token || !window.confirm('Are you sure you want to delete this show? This cannot be undone.')) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/shows/${showId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) navigate({ to: '/' })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <div className="w-7 h-7 border-2 border-neutral-800 border-t-[#CC0000] rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !show) {
    return (
      <div className="flex flex-col items-center justify-center py-28 px-6 text-center">
        <p className="text-neutral-400 mb-4">Show not found.</p>
        <Link to="/" className="text-sm text-[#CC0000] font-medium hover:underline">
          Back to all shows
        </Link>
      </div>
    )
  }

  const isOwner = user && show.createdBy === user.id

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back */}
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Shows
      </button>

      <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
        {/* Left: Image + Actions */}
        <div className="md:col-span-2 space-y-5">
          {/* Image */}
          <div className="aspect-square bg-neutral-900 border border-neutral-800 overflow-hidden">
            {show.imageData ? (
              <img
                src={`/api/images/${show.id}`}
                alt={show.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            )}
          </div>

          {/* RSVP */}
          {user?.verified ? (
            <button
              onClick={handleRSVP}
              disabled={rsvpLoading}
              className={`w-full font-semibold py-3 text-sm transition-colors disabled:opacity-60 ${
                attending
                  ? 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white'
                  : 'bg-[#CC0000] text-white hover:bg-[#AA0000]'
              }`}
            >
              {rsvpLoading ? '...' : attending ? "Can't Make It" : "I'm Going"}
            </button>
          ) : user && !user.verified ? (
            <Link
              to="/verify"
              search={{ email: user.email }}
              className="w-full block text-center bg-neutral-900 border border-neutral-800 text-neutral-400 font-medium py-3 text-sm hover:border-neutral-600 hover:text-white transition-colors"
            >
              Verify email to RSVP
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full block text-center bg-neutral-900 border border-neutral-800 text-neutral-400 font-medium py-3 text-sm hover:border-neutral-600 hover:text-white transition-colors"
            >
              Sign in to RSVP
            </Link>
          )}

          {/* Owner controls */}
          {isOwner && (
            <div className="flex gap-2">
              <Link
                to="/post-show"
                search={{ edit: showId }}
                className="flex-1 text-center bg-neutral-900 border border-neutral-800 text-neutral-400 font-medium py-2.5 text-sm hover:border-neutral-600 hover:text-white transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-400 font-medium py-2.5 text-sm hover:border-red-900 hover:text-[#CC0000] transition-colors disabled:opacity-50"
              >
                {deleteLoading ? '...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="md:col-span-3 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                  show.category === 'berklee'
                    ? 'bg-[#CC0000] text-white'
                    : 'border border-neutral-700 text-neutral-500'
                }`}
              >
                {show.category === 'berklee' ? 'Berklee Events' : 'DIY'}
              </span>
              {show.genre && (
                <span className="text-[10px] text-neutral-600 border border-neutral-800 px-2 py-0.5 font-medium">
                  {show.genre}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{show.title}</h1>
          </div>

          {/* Meta */}
          <div className="space-y-3 py-5 border-t border-b border-neutral-800">
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#CC0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-white text-sm font-medium">{formatDate(show.date)}</p>
                {show.time && <p className="text-neutral-500 text-sm">{formatTime(show.time)}</p>}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#CC0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-white text-sm font-medium">{show.venue}</p>
            </div>
            {show.lineup && (
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#CC0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-white text-sm font-medium">{show.lineup}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {show.description && (
            <div>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">
                About This Show
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                {show.description}
              </p>
            </div>
          )}

          {/* Ticket Link */}
          {show.ticketLink && (
            <a
              href={show.ticketLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#CC0000] hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Get Tickets
            </a>
          )}

          {/* Submitted by */}
          <p className="text-xs text-neutral-700">
            Posted by {show.createdByName} ·{' '}
            {new Date(show.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>

          {/* Attendees */}
          <div className="pt-5 border-t border-neutral-800">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">
              Attending ({attendees.length})
            </h2>
            {attendees.length === 0 ? (
              <p className="text-neutral-700 text-sm">No RSVPs yet. Be the first to say you're going.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {attendees.map((a) => (
                  <span
                    key={a.userId}
                    className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300 font-medium"
                  >
                    {a.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
