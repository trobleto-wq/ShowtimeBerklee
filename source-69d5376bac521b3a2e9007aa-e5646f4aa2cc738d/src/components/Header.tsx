import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
    setMenuOpen(false)
  }

  return (
    <header className="bg-black border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link to="/" className="flex flex-col leading-tight">
          <span className="text-[10px] font-semibold tracking-[0.25em] text-neutral-500 uppercase">
            Berklee College of Music
          </span>
          <span className="text-lg font-bold text-white tracking-tight">
            Showtime<span className="text-[#CC0000]"> Berklee</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            to="/"
            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors [&.active]:text-white"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors [&.active]:text-white"
          >
            About
          </Link>
          {user?.verified && (
            <Link
              to="/post-show"
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors [&.active]:text-white"
            >
              Post a Show
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-5">
              <span className="text-sm text-neutral-500 max-w-[140px] truncate">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-[#CC0000] text-white text-sm font-semibold px-4 py-2 hover:bg-[#AA0000] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-neutral-400 hover:text-white transition-colors p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-neutral-800 px-6 py-5 flex flex-col gap-5">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-neutral-300">
            Home
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-neutral-300">
            About
          </Link>
          {user?.verified && (
            <Link to="/post-show" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-neutral-300">
              Post a Show
            </Link>
          )}
          {user ? (
            <>
              <span className="text-sm text-neutral-600">{user.email}</span>
              <button onClick={handleLogout} className="text-left text-sm font-medium text-neutral-300">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-neutral-300">
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold text-[#CC0000]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
