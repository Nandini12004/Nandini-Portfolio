import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'

function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to log in.')
      }

      navigate('/admin/dashboard')
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="admin-auth">
      <form className="admin-auth__card" onSubmit={submitLogin}>
        <div className="admin-auth__icon"><LockKeyhole size={22} /></div>
        <p className="section-kicker">PRIVATE AREA</p>
        <h1>Admin Login</h1>
        <label>Email<input name="email" type="email" value={form.email} onChange={updateForm} required autoComplete="username" /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={updateForm} required autoComplete="current-password" /></label>
        {error && <p className="form-status form-status--error">{error}</p>}
        <button className="button button--primary" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}

export default AdminLogin
