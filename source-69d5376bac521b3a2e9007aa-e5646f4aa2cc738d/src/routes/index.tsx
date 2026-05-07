import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'

interface Show {
  id: string
  title: string
  date: string
  time: string
  venue: string
  lineup: string
  genre: string
  category: 'diy' | 'berklee'
  hasImage: boolean
  createdByName: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function ShowCard({ show }: { show: Show }) {
  return (
    <Link
      to="/shows/$showId"
      params={{ showId: show.id }}
      className="block group bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all duration-200 overflow-hidden"
    >
      <div className="aspect-video bg-neutral-800 overflow-hidden relative">
        {show.hasImage ? (
          <img
            src={`/api/images/${show.id}`}
            alt={show.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-900">
            <svg className="w-12 h-12 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
              show.category === 'berklee'
                ? 'bg-[#CC0000] text-white'
                : 'bg-neutral-900/90 border border-neutral-600 text-neutral-300'
            }`}
          >
            {show.category === 'berklee' ? 'Berklee' : 'DIY'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white text-sm leading-snug mb-3 group-hover:text-[#CC0000] transition-colors line-clamp-2">
          {show.title}
        </h3>
        <div className="space-y-1.5 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-neutral-400">
              {formatDate(show.date)}
              {show.time ? ` · ${formatTime(show.time)}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-neutral-400 truncate">{show.venue}</span>
          </div>
          {show.lineup && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">{show.lineup}</span>
            </div>
          )}
          {show.genre && (
            <span className="inline-block text-[10px] text-neutral-600 font-medium border border-neutral-800 px-2 py-0.5 mt-1">
              {show.genre}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'diy' | 'berklee'>('all')

  const fetchShows = useCallback(async () => {
    try {
      const res = await fetch('/api/shows')
      const data = await res.json()
      setShows(data.shows || [])
    } catch {
      setShows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchShows()
  }, [fetchShows])

  const filteredShows = shows.filter((show) => {
    const matchesFilter = activeFilter === 'all' || show.category === activeFilter
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      show.title.toLowerCase().includes(q) ||
      show.venue.toLowerCase().includes(q) ||
      show.lineup.toLowerCase().includes(q) ||
      show.genre.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-black border-b border-neutral-800 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold tracking-[0.35em] text-neutral-500 uppercase mb-6">
            Berklee College of Music
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight leading-none">
            Showtime<span className="text-[#CC0000]"> Berklee</span>
          </h1>
          <p className="text-base md:text-lg text-neutral-500 font-normal tracking-widest uppercase mt-5">
            Find Shows. Be The Scene.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="bg-neutral-950 border-b border-neutral-800 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search artist, venue, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
          <div className="flex gap-1.5 shrink-0">
            {(['all', 'diy', 'berklee'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  activeFilter === f
                    ? 'bg-[#CC0000] text-white'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600'
                }`}
              >
                {f === 'all' ? 'All' : f === 'diy' ? 'DIY' : 'Berklee Events'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-28">
            <div className="w-7 h-7 border-2 border-neutral-800 border-t-[#CC0000] rounded-full animate-spin" />
          </div>
        ) : filteredShows.length === 0 ? (
          <div className="text-center py-28">
            <svg className="w-10 h-10 text-neutral-800 mx-auto mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="text-neutral-400 text-base font-medium">
              {search || activeFilter !== 'all'
                ? 'No shows match your search.'
                : 'No shows yet—be the first to post one.'}
            </p>
            {!search && activeFilter === 'all' && (
              <p className="text-neutral-700 text-sm mt-2">
                Sign up and post a show to get the scene going.
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-neutral-600 font-medium uppercase tracking-wider mb-6">
              {filteredShows.length} upcoming show{filteredShows.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredShows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
