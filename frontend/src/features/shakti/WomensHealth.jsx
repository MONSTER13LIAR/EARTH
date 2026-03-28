import { useState } from 'react'
import { getWomensHealthAdvice } from '../../services/featherless'
import styles from './WomensHealth.module.css'

export default function WomensHealth({ setView }) {
  const [problem, setProblem] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!problem.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await getWomensHealthAdvice(problem.trim())
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setProblem('')
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
        <h1 className={styles.title}>Women's Health Guide</h1>
        <p className={styles.subtitle}>Describe your problem privately — get caring, honest advice</p>
      </div>

      {!result && (
        <div className={styles.card}>
          <div className={styles.safeNote}>
            This is completely private. No one else can see what you write here.
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>What health problem are you facing?</label>
            <textarea
              className={styles.textarea}
              placeholder="Describe your problem freely — e.g. irregular periods, stomach pain, white discharge, weakness, headaches, skin problem, pregnancy doubt..."
              value={problem}
              onChange={e => setProblem(e.target.value)}
              disabled={loading}
              rows={6}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!problem.trim() || loading}
          >
            {loading ? (
              <><span className={styles.btnSpinner} /> Getting advice...</>
            ) : (
              '🌸 Get Health Advice'
            )}
          </button>
        </div>
      )}

      {result && (
        <div className={styles.resultBox}>

          {result.urgent && (
            <div className={styles.urgentBanner}>
              This sounds serious. Please visit a doctor or hospital as soon as possible.
            </div>
          )}

          {result.summary && (
            <div className={styles.summaryBox}>
              <p className={styles.summaryText}>{result.summary}</p>
            </div>
          )}

          {result.home_care?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>What you can do at home</p>
              <ol className={styles.stepList}>
                {result.home_care.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
          )}

          {result.when_to_see_doctor && (
            <div className={styles.doctorBox}>
              <p className={styles.doctorLabel}>When to see a doctor</p>
              <p className={styles.doctorText}>{result.when_to_see_doctor}</p>
            </div>
          )}

          {result.warning_signs?.length > 0 && (
            <div className={styles.warningBox}>
              <p className={styles.warningLabel}>Go to a doctor immediately if you have</p>
              <ul className={styles.warningList}>
                {result.warning_signs.map((sign, i) => <li key={i}>{sign}</li>)}
              </ul>
            </div>
          )}

          <button className={styles.resetBtn} onClick={handleReset}>Ask About Another Problem</button>
        </div>
      )}
    </div>
  )
}
