import { useEffect, useState } from 'react'
import { fetchMyHistory } from '../services/api'
import styles from './History.module.css'

const FEATURE_META = {
  'medicine-label-reader': { label: 'Dawa Sunaao',    color: '#E53935' },
  'symptom-checker':       { label: 'Swasth Raho',    color: '#8E24AA' },
  'doctor-visit-explainer':{ label: 'Doctor Visit',   color: '#00897B' },
  'doctor-or-home-decision':{ label: 'Doctor Visit',  color: '#00897B' },
  'chat':                  { label: 'EARTH Chat',     color: '#1E88E5' },
}

function featureMeta(feature) {
  const key = Object.keys(FEATURE_META).find(k => feature?.toLowerCase().includes(k))
  return key ? FEATURE_META[key] : { label: feature || 'EARTH', color: '#757575' }
}

function formatTime(isoStr) {
  const d = new Date(isoStr)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return `Today, ${timeStr}`
  if (diffDays === 1) return `Yesterday, ${timeStr}`
  return `${diffDays} days ago, ${timeStr}`
}

const MOCK_DATA = [
  { id: 1, time: 'Today, 10:30 AM',      tool: 'Dawa Sunaao', result: 'Paracetamol 500mg — Take twice daily',              color: '#E53935' },
  { id: 2, time: 'Today, 9:15 AM',       tool: 'Swasth Raho', result: 'Detected: Leaf blight — Apply copper fungicide',    color: '#8E24AA' },
  { id: 3, time: 'Yesterday, 4:00 PM',   tool: 'EARTH Chat',  result: 'Chapter 3 Science simplified in Hindi',             color: '#1E88E5' },
  { id: 4, time: 'Yesterday, 11:00 AM',  tool: 'Doctor Visit',result: 'Follow-up in 2 weeks, avoid spicy food',            color: '#00897B' },
  { id: 5, time: '2 days ago, 3:30 PM',  tool: 'Dawa Sunaao', result: 'Metformin 500mg — Take with meals',                 color: '#E53935' },
  { id: 6, time: '3 days ago, 8:00 AM',  tool: 'Swasth Raho', result: 'Possible viral fever — rest and hydrate',           color: '#8E24AA' },
]

export default function History({ user, onSignInClick, onSignOut }) {
  const [activities, setActivities] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (!user) { setActivities([]); return }
    setLoadingHistory(true)
    fetchMyHistory()
      .then(data => setActivities(data.activities || []))
      .catch(() => setActivities([]))
      .finally(() => setLoadingHistory(false))
  }, [user])

  const historyItems = user
    ? activities.map(a => {
        const meta = featureMeta(a.feature)
        return {
          id: a._id,
          time: formatTime(a.createdAt),
          tool: meta.label,
          result: a.outputSummary || a.inputSummary || '—',
          color: meta.color,
        }
      })
    : MOCK_DATA

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authSection}>
        {user ? (
          <div>
            <h2 className={styles.authHeading}>Welcome back, {user.name}!</h2>
            <p className={styles.authSubtitle}>{user.email}</p>
            <button className={styles.googleBtn} onClick={onSignOut} style={{ marginTop: '16px' }}>
              <span className={styles.googleText}>Sign Out</span>
            </button>
          </div>
        ) : (
          <>
            <div>
              <h2 className={styles.authHeading}>Sign in to save your history</h2>
              <p className={styles.authSubtitle}>Your scans, results and history — all in one place</p>
            </div>

            <button className={styles.googleBtn} onClick={onSignInClick}>
              <span className={styles.googleText}>Sign in with Email and Password</span>
            </button>

            <div className={styles.arrowContainer}>
              <svg className={styles.bigRedArrow} viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </div>
          </>
        )}
      </div>

      <div className={styles.timeline}>
        {loadingHistory && (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>Loading history…</p>
        )}

        {!loadingHistory && user && activities.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>No history yet. Start using EARTH tools!</p>
        )}

        {historyItems.map((item) => (
          <div key={item.id} className={styles.itemContainer}>
            <div className={styles.dot} />
            <div className={styles.card}>
              <div className={styles.badge} style={{ backgroundColor: item.color }}>
                {item.tool}
              </div>
              <span className={styles.timestamp}>{item.time}</span>
              <p className={styles.result}>{item.result}</p>

              {!user && (
                <div className={styles.watermark}>
                  <svg className={styles.lockIcon} viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                  <span className={styles.watermarkText}>Login to save your history</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
