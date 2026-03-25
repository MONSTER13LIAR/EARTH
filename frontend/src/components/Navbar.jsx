import { useMemo, useState } from 'react'
import { clearAuthSession, login, signup } from '../services/api'
import styles from './Navbar.module.css'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U'
}

export default function Navbar({ setView, currentUser, onAuthSuccess, onLogout }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const profileInitials = useMemo(() => initials(currentUser?.name), [currentUser])

  const handleClick = (e, view) => {
    e.preventDefault()
    setView(view)
    setMenuOpen(false)
  }

  const handleAuthSubmit = async () => {
    setError('')
    if (!form.email.trim() || !form.password.trim() || (mode === 'signup' && !form.name.trim())) {
      setError('Please fill all required fields.')
      return
    }

    setLoading(true)
    try {
      const payload = mode === 'signup'
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password }

      const data = mode === 'signup' ? await signup(payload) : await login(payload)
      onAuthSuccess?.(data.user)
      setAuthOpen(false)
      setForm({ name: '', email: '', password: '' })
      setView('tools')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuthSession()
    onLogout?.()
    setMenuOpen(false)
    setView('home')
  }

  return (
    <nav className={styles.navWrapper}>
      <div className={styles.pill}>
        <ul className={styles.links}>
          <li><a href='#home' onClick={(e) => handleClick(e, 'home')}>Home</a></li>
          <li><a href='#tools' onClick={(e) => handleClick(e, 'tools')}>Tools</a></li>
          <li><a href='#history' onClick={(e) => handleClick(e, 'history')}>History</a></li>
          <li><a href='#about' onClick={(e) => handleClick(e, 'about')}>About</a></li>
        </ul>

        {!currentUser ? (
          <div className={styles.authActions}>
            <button className={styles.loginBtn} onClick={() => { setMode('login'); setAuthOpen(true) }}>Login</button>
            <button className={styles.signupBtn} onClick={() => { setMode('signup'); setAuthOpen(true) }}>Sign up</button>
          </div>
        ) : (
          <div className={styles.profileArea}>
            <button className={styles.profileBtn} onClick={() => setMenuOpen((v) => !v)}>
              <span className={styles.avatar}>{profileInitials}</span>
              <span className={styles.userName}>{currentUser.name}</span>
            </button>
            {menuOpen && (
              <div className={styles.profileMenu}>
                <p>{currentUser.email}</p>
                <button onClick={() => setView('history')}>View history</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>

      {authOpen && (
        <div className={styles.authModalBackdrop} onClick={() => setAuthOpen(false)}>
          <div className={styles.authModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modeRow}>
              <button className={mode === 'login' ? styles.modeActive : styles.modeBtn} onClick={() => setMode('login')}>Login</button>
              <button className={mode === 'signup' ? styles.modeActive : styles.modeBtn} onClick={() => setMode('signup')}>Sign up</button>
            </div>

            {mode === 'signup' && (
              <input
                className={styles.authInput}
                placeholder='Full name'
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            )}

            <input
              className={styles.authInput}
              placeholder='Email'
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />

            <input
              className={styles.authInput}
              type='password'
              placeholder='Password'
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />

            {error ? <p className={styles.authError}>{error}</p> : null}

            <button className={styles.authSubmit} onClick={handleAuthSubmit} disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Continue'}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
