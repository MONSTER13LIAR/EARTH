import { useState } from 'react'
import { findWomensScholarships } from '../../services/featherless'
import styles from './WomensSchemes.module.css'

const CLASS_OPTIONS = [
  '8th or below',
  '9th',
  '10th (Matric)',
  '11th',
  '12th (Intermediate)',
  'ITI / Diploma',
  'Undergraduate (BA/BSc/BCom etc.)',
  'Engineering / B.Tech',
  'Medical / MBBS',
  'Postgraduate (MA/MSc/MCom etc.)',
  'PhD / Research',
  'Completed studies — looking for skill course',
]

export default function WomensSchemes({ setView }) {
  const [currentClass, setCurrentClass] = useState('')
  const [qualification, setQualification] = useState('')
  const [course, setCourse] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('scholarships')

  const handleFind = async () => {
    if (!currentClass) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await findWomensScholarships({ qualification, currentClass, course })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentClass('')
    setQualification('')
    setCourse('')
    setResult(null)
    setError('')
    setTab('scholarships')
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
        <h1 className={styles.title}>Scholarships & Schemes</h1>
        <p className={styles.subtitle}>Tell us your education level — we will find what you are eligible for</p>
      </div>

      {!result && (
        <div className={styles.card}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>What class / level are you currently studying? <span className={styles.required}>*</span></label>
            <select
              className={styles.select}
              value={currentClass}
              onChange={e => setCurrentClass(e.target.value)}
              disabled={loading}
            >
              <option value="">Select your current class...</option>
              {CLASS_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Highest qualification completed <span className={styles.optional}>(optional)</span></label>
            <input
              className={styles.input}
              placeholder="e.g. 10th pass, 12th pass, BA graduate..."
              value={qualification}
              onChange={e => setQualification(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Any specific course you want to do? <span className={styles.optional}>(optional)</span></label>
            <input
              className={styles.input}
              placeholder="e.g. Nursing, Computer course, Fashion design, Teaching..."
              value={course}
              onChange={e => setCourse(e.target.value)}
              disabled={loading}
              onKeyDown={e => e.key === 'Enter' && handleFind()}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.findBtn}
            onClick={handleFind}
            disabled={!currentClass || loading}
          >
            {loading ? (
              <><span className={styles.btnSpinner} /> Finding scholarships...</>
            ) : (
              '🎓 Find Scholarships & Schemes'
            )}
          </button>
        </div>
      )}

      {result && (
        <div className={styles.resultBox}>
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.resultTitle}>Results for {currentClass}</p>
              {course && <p className={styles.resultSub}>Course interest: {course}</p>}
            </div>
            <button className={styles.resetBtn} onClick={handleReset}>Search Again</button>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'scholarships' ? styles.tabActive : ''}`}
              onClick={() => setTab('scholarships')}
            >
              Scholarships ({result.scholarships?.length || 0})
            </button>
            <button
              className={`${styles.tab} ${tab === 'schemes' ? styles.tabActive : ''}`}
              onClick={() => setTab('schemes')}
            >
              Govt Schemes ({result.schemes?.length || 0})
            </button>
          </div>

          {tab === 'scholarships' && (
            <>
              {result.scholarships?.length === 0 && (
                <div className={styles.noneBox}>
                  <p>No specific scholarships found. Try selecting a different class level.</p>
                </div>
              )}
              {result.scholarships?.map((s, i) => (
                <div key={i} className={styles.itemCard}>
                  <div className={styles.itemTop}>
                    <p className={styles.itemName}>{s.name}</p>
                    {s.by && <span className={styles.byBadge}>{s.by}</span>}
                  </div>
                  {s.benefit && (
                    <div className={styles.itemSection}>
                      <p className={styles.itemLabel}>Benefit</p>
                      <p className={styles.itemText}>{s.benefit}</p>
                    </div>
                  )}
                  {s.eligibility && (
                    <div className={styles.itemSection}>
                      <p className={styles.itemLabel}>Who can apply</p>
                      <p className={styles.itemText}>{s.eligibility}</p>
                    </div>
                  )}
                  {s.how_to_apply && (
                    <div className={styles.itemSection}>
                      <p className={styles.itemLabel}>How to apply</p>
                      <p className={`${styles.itemText} ${styles.applyText}`}>{s.how_to_apply}</p>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {tab === 'schemes' && (
            <>
              {result.schemes?.length === 0 && (
                <div className={styles.noneBox}>
                  <p>No schemes found for this profile.</p>
                </div>
              )}
              {result.schemes?.map((s, i) => (
                <div key={i} className={styles.itemCard}>
                  <p className={styles.itemName}>{s.name}</p>
                  {s.benefit && (
                    <div className={styles.itemSection}>
                      <p className={styles.itemLabel}>Benefit</p>
                      <p className={styles.itemText}>{s.benefit}</p>
                    </div>
                  )}
                  {s.eligibility && (
                    <div className={styles.itemSection}>
                      <p className={styles.itemLabel}>Who can apply</p>
                      <p className={styles.itemText}>{s.eligibility}</p>
                    </div>
                  )}
                  {s.how_to_apply && (
                    <div className={styles.itemSection}>
                      <p className={styles.itemLabel}>How to apply</p>
                      <p className={`${styles.itemText} ${styles.applyText}`}>{s.how_to_apply}</p>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
