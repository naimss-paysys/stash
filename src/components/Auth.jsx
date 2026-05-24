import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setSuccess('Password reset link sent! Check your email.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <Bookmark className="w-7 h-7 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-100">Stash</h1>
          <p className="text-gray-400 mt-1 text-sm">Your personal capture tool</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-5">
            {mode === 'signin' && 'Sign in to your account'}
            {mode === 'signup' && 'Create an account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-3 py-2 bg-green-900/30 border border-green-800 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm text-gray-400">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  name={mode === 'signup' ? 'new-password' : 'current-password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 transition-colors"
            >
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                ? 'Sign In'
                : mode === 'signup'
                ? 'Create Account'
                : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400 space-y-2">
            {mode === 'signin' && (
              <p>
                No account?{' '}
                <button onClick={() => switchMode('signup')} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Sign up
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p>
                Have an account?{' '}
                <button onClick={() => switchMode('signin')} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Sign in
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <p>
                <button onClick={() => switchMode('signin')} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Back to sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
