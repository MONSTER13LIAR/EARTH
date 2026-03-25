import { useEffect, useState } from 'react'
import { fetchMyHistory, getCurrentUser } from '../services/api'
import styles from './History.module.css'

function prettyTime(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  return date.toLocaleString()
}

export default function History() {
  const [user] = useState(getCurrentUser())
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const historyData = await fetchMyHistory()
        setActivities(historyData.activities || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [user])

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerCard}>
        <h2>Personal Activity Timeline</h2>
        <p>
          {!user
            ? 'Please login from the navbar to see your personalized history.'
            : `Signed in as ${user.name} (${user.email})`}
        </p>
      </div>

      <div className={styles.timeline}>
        {loading && <p className={styles.loading}>Loading your history...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !user && (
          <div className={styles.emptyState}>Login is required to access your private activity history.</div>
        )}

        {!loading && user && activities.length === 0 && (
          <div className={styles.emptyState}>No activity yet. Start using tools to build your timeline.</div>
        )}

        {!loading && activities.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.featureBadge}>{item.feature}</div>
            <p className={styles.time}>{prettyTime(item.createdAt)}</p>
            <p className={styles.text}><strong>Input:</strong> {item.inputSummary}</p>
            <p className={styles.text}><strong>Output:</strong> {item.outputSummary}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
