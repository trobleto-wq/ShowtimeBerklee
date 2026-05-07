import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { z } from 'zod'

const searchSchema = z.object({
  email: z.string().optional(),
  code: z.string().optional(),
})

export const Route = createFileRoute('/verify')({
  validateSearch: searchSchema,
  component: VerifyPage,
})

function VerifyPage() {
  const { email, code: mockCode } = Route.useSearch()
  const navigate = useNavigate()
  const [inputs, setInputs] = useState(['', '', '', '', '', ''])
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCode, setResendCode] = useState<string | null>(null)

  const code = inputs.join('')

  const handleInput = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...inputs]
    next[i] = digit
    setInputs(next)
    if (digit && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !inputs[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setInputs(pasted.split(''))
      refs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.')
      return
    }
    if (!email) {
      setError('Email address is missing. Please sign up again.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed')
        return
      }
      setSuccess('Email verified! Redirecting to sign in...')
      setTimeout(() => navigate({ to: '/login' }), 1800)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setResendLoading(true)
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setResendCode(data.verificationCode)
        setError('')
        setInputs(['', '', '', '', '', ''])
        refs.current[0]?.focus()
      } else {
        setError(data.error || 'Failed to resend code')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setResendLoading(false)
    }
  }

  const displayCode = resendCode || mockCode

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-neutral-600 uppercase mb-2">
            Showtime Berklee
          </p>
          <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Enter the 6-digit code sent to{' '}
            <span className="text-white font-medium">{email || 'your email'}</span>.
          </p>
        </div>

        {/* Dev mode: show the code */}
        {displayCode && (
          <div className="mb-6 bg-neutral-900 border border-neutral-700 px-4 py-3">
            <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Development Mode — Verification Code
            </p>
            <p className="text-xl font-bold text-[#CC0000] tracking-[0.2em]">{displayCode}</p>
            <p className="text-[10px] text-neutral-600 mt-1">
              In production, this would be sent to your email address.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Verification Code
            </label>
            <div className="flex gap-2" onPaste={handlePaste}>
              {inputs.map((val, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-full aspect-square text-center text-xl font-bold bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-[#CC0000] transition-colors"
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 bg-[#CC0000]/10 px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-sm border border-green-400/30 bg-green-400/10 px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full bg-[#CC0000] hover:bg-[#AA0000] disabled:opacity-60 text-white font-semibold py-3 text-sm transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-neutral-600">
            Didn't receive a code?{' '}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-white hover:text-[#CC0000] transition-colors font-medium disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
