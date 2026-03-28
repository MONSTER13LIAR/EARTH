import { useState } from 'react'
import { findWomensRights } from '../../services/featherless'
import styles from './WomensRights.module.css'

export default function WomensRights({ setView }) {
  const [situation, setSituation] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!situation.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await findWomensRights(situation.trim())
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSituation('')
    setResult(null)
    setError('')
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => setView('shakti')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Know Your Rights</h1>
        <p className={styles.subtitle}>Tell us what you are going through — we will tell you what Indian law says and what you can do</p>
      </div>

      {!result && (
        <div className={styles.card}>
          <div className={styles.safeNote}>
            Your story is private. Type freely — no one else can see this.
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>What are you going through?</label>
            <textarea
              className={styles.textarea}
              placeholder="Describe your situation — e.g. my husband beats me, my in-laws are demanding dowry, my employer is harassing me, I am being threatened..."
              value={situation}
              onChange={e => setSituation(e.target.value)}
              disabled={loading}
              rows={6}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!situation.trim() || loading}
          >
            {loading ? (
              <><span className={styles.btnSpinner} /> Finding your rights...</>
            ) : (
              '⚖️ Know My Rights'
            )}
          </button>
        </div>
      )}

      {result && (
        <div className={styles.resultBox}>

          {result.urgent && (
            <div className={styles.urgentBanner}>
              You may be in danger. Please call <strong>100 (Police)</strong> or <strong>181 (Women Helpline)</strong> immediately.
            </div>
          )}

          {result.summary && (
            <div className={styles.summaryBox}>
              <p className={styles.summaryText}>{result.summary}</p>
            </div>
          )}

          {result.laws?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Laws that protect you</p>
              <div className={styles.lawsList}>
                {result.laws.map((law, i) => (
                  <div key={i} className={styles.lawCard}>
                    <p className={styles.lawName}>{law.name}</p>
                    <p className={styles.lawText}>{law.protection}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.steps?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>What you can do right now</p>
              <ol className={styles.stepList}>
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {result.helplines?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Helplines</p>
              <div className={styles.helplineGrid}>
                {result.helplines.map((h, i) => (
                  <a key={i} href={`tel:${h.number}`} className={styles.helplineCard}>
                    <span className={styles.helplineNumber}>{h.number}</span>
                    <span className={styles.helplineName}>{h.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <button className={styles.resetBtn} onClick={handleReset}>Ask About Another Situation</button>
        </div>
      )}
    </div>
  )
}
