import { useState } from 'react'
import { findGovernmentSchemes } from '../../services/featherless'
import { logToolActivity } from '../../services/api'
import styles from './SchemeFinder.module.css'

export default function SchemeFinder({ setView }) {
  const [career, setCareer] = useState('')
  const [schemes, setSchemes] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSearch = async () => {
    const trimmed = career.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    setSchemes([])
    setJobs([])
    setSubmitted(true)
    try {
      const result = await findGovernmentSchemes(trimmed)
      setSchemes(result.schemes || [])
      setJobs(result.jobs || [])
      logToolActivity(
        'scheme-finder',
        `Career: ${trimmed}`,
        result.schemes?.length > 0
          ? `${result.schemes.length} schemes: ${result.schemes.slice(0, 2).map(s => s.name).join(', ')}`
          : 'No schemes found'
      )
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleReset = () => {
    setCareer('')
    setSchemes([])
    setJobs([])
    setError('')
    setSubmitted(false)
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => setView('pustak-dost')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Scheme & Job Finder</h1>
        <p className={styles.subtitle}>Find Indian government schemes made for your field</p>
      </div>

      {/* INPUT CARD */}
      <div className={styles.inputCard}>
        <span className={styles.inputIcon}>🏛️</span>
        <p className={styles.inputHeading}>What career or field are you in?</p>
        <p className={styles.inputSub}>e.g. Farming, Teaching, Nursing, Tailoring, IT, Driving...</p>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            placeholder="Type your career or field..."
            value={career}
            onChange={e => setCareer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className={styles.searchBtn}
            onClick={handleSearch}
            disabled={!career.trim() || loading}
          >
            {loading ? <span className={styles.btnSpinner} /> : 'Search'}
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className={styles.statusBox}>
          <div className={styles.spinner} />
          <p className={styles.statusText}>Finding schemes for <strong style={{ color: '#90caf9' }}>{career}</strong>...</p>
        </div>
      )}

      {/* ERROR */}
      {error && <p className={styles.error}>{error}</p>}

      {/* RESULTS */}
      {!loading && schemes.length > 0 && (
        <div className={styles.resultsWrap}>
          <div className={styles.resultsHeader}>
            <p className={styles.resultsTitle}>
              Results for <span className={styles.careerHighlight}>"{career}"</span>
            </p>
            <button className={styles.resetBtn} onClick={handleReset}>Search Again</button>
          </div>

          {/* SCHEMES */}
          <p className={styles.sectionHeading}>🏛️ Government Schemes</p>
          <div className={styles.schemeList}>
            {schemes.map((s, i) => (
              <div key={i} className={styles.schemeCard}>
                <div className={styles.schemeTop}>
                  <div>
                    <p className={styles.schemeName}>{s.name}</p>
                    {s.ministry && <span className={styles.ministryBadge}>{s.ministry}</span>}
                  </div>
                </div>

                <p className={styles.schemeBenefit}>{s.benefit}</p>

                <div className={styles.schemeDetails}>
                  {s.who_can_apply && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>✅ Who can apply</span>
                      <span className={styles.detailValue}>{s.who_can_apply}</span>
                    </div>
                  )}
                  {s.how_to_apply && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>📋 How to apply</span>
                      <span className={styles.detailValue}>{s.how_to_apply}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* JOB PORTALS */}
          {jobs.length > 0 && (
            <>
              <p className={styles.sectionHeading} style={{ marginTop: 36 }}>💼 Where to Find Jobs</p>
              <div className={styles.jobList}>
                {jobs.map((j, i) => (
                  <div key={i} className={styles.jobCard}>
                    <div className={styles.jobTop}>
                      <p className={styles.jobPlatform}>{j.platform}</p>
                      <span className={`${styles.jobTypeBadge} ${j.type === 'Government' ? styles.jobTypeGov : styles.jobTypePrivate}`}>
                        {j.type}
                      </span>
                    </div>
                    <p className={styles.jobWhat}>{j.what_to_find}</p>
                    {j.url_hint && (
                      <span className={styles.jobUrl}>🌐 {j.url_hint}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && submitted && schemes.length === 0 && !error && (
        <p className={styles.emptyText}>No schemes found. Try a different career name.</p>
      )}
    </div>
  )
}
