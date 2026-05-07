import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { z } from 'zod'

const searchSchema = z.object({
  edit: z.string().optional(),
})

export const Route = createFileRoute('/post-show')({
  validateSearch: searchSchema,
  component: PostShowPage,
})

function PostShowPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const { edit: editId } = Route.useSearch()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [lineup, setLineup] = useState('')
  const [description, setDescription] = useState('')
  const [ticketLink, setTicketLink] = useState('')
  const [genre, setGenre] = useState('')
  const [category, setCategory] = useState<'diy' | 'berklee'>('diy')
  const [imageData, setImageData] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing show data if editing
  useEffect(() => {
    if (!editId) return
    fetch(`/api/shows/${editId}`)
      .then((r) => r.json())
      .then(({ show }) => {
        if (show) {
          setTitle(show.title || '')
          setDate(show.date || '')
          setTime(show.time || '')
          setVenue(show.venue || '')
          setLineup(show.lineup || '')
          setDescription(show.description || '')
          setTicketLink(show.ticketLink || '')
          setGenre(show.genre || '')
          setCategory(show.category || 'diy')
          if (show.imageData) {
            setImageData(show.imageData)
          }
        }
      })
      .catch(() => {})
  }, [editId])

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageData(e.target?.result as string)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!user?.verified) {
      setError('Your email must be verified to post shows.')
      return
    }
    setLoading(true)
    try {
      const payload = { title, date, time, venue, lineup, description, ticketLink, genre, category, imageData }
      const url = editId ? `/api/shows/${editId}` : '/api/shows'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save show')
        return
      }
      navigate({ to: '/' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">You need to be signed in to post a show.</p>
          <Link to="/login" className="bg-[#CC0000] text-white font-semibold px-6 py-3 text-sm hover:bg-[#AA0000] transition-colors inline-block">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (!user.verified) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-neutral-400 mb-2">Email verification required to post shows.</p>
          <Link to="/verify" search={{ email: user.email }} className="text-[#CC0000] text-sm font-medium hover:underline">
            Verify your email
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-neutral-600 uppercase mb-2">
          Showtime Berklee
        </p>
        <h1 className="text-2xl font-bold text-white">
          {editId ? 'Edit Show' : 'Post a Show'}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Your show will appear immediately in the public feed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
            Show Title <span className="text-[#CC0000]">*</span>
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="e.g. Friday Night Live at The Rat"
          />
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Date <span className="text-[#CC0000]">*</span>
            </label>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-600 transition-colors [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-600 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Venue */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
            Venue / Location <span className="text-[#CC0000]">*</span>
          </label>
          <input
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="e.g. The Rat, 528 Commonwealth Ave"
          />
        </div>

        {/* Lineup */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
            Artist Lineup
          </label>
          <input
            value={lineup}
            onChange={(e) => setLineup(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="e.g. The Velvets, Sky Jones, more TBA"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            placeholder="Tell people about the show..."
          />
        </div>

        {/* Ticket Link + Genre */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Ticket Link
            </label>
            <input
              type="url"
              value={ticketLink}
              onChange={(e) => setTicketLink(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Genre
            </label>
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="e.g. Indie Rock, Jazz, Hip-Hop"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Category
          </label>
          <div className="flex gap-2">
            {(['diy', 'berklee'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  category === c
                    ? 'bg-[#CC0000] text-white'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600'
                }`}
              >
                {c === 'diy' ? 'DIY' : 'Berklee Events'}
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Cover Image
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed cursor-pointer transition-colors ${
              dragging
                ? 'border-[#CC0000] bg-[#CC0000]/5'
                : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900'
            }`}
          >
            {imageData ? (
              <div className="relative">
                <img src={imageData} alt="Preview" className="w-full max-h-52 object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Click to change image</p>
                </div>
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-center">
                  <p className="text-sm text-neutral-400 font-medium">Drag & drop or click to upload</p>
                  <p className="text-xs text-neutral-600 mt-1">PNG, JPG, GIF — max 5MB</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {imageData && (
            <button
              type="button"
              onClick={() => { setImageData(null) }}
              className="mt-2 text-xs text-neutral-600 hover:text-white transition-colors"
            >
              Remove image
            </button>
          )}
        </div>

        {error && (
          <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 bg-[#CC0000]/10 px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#CC0000] hover:bg-[#AA0000] disabled:opacity-60 text-white font-semibold px-8 py-3 text-sm transition-colors"
          >
            {loading ? 'Saving...' : editId ? 'Save Changes' : 'Post Show'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white font-medium px-6 py-3 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
