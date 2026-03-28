import { useState } from 'react'
import { findFarmingSchemes } from '../../services/featherless'
import { logToolActivity } from '../../services/api'
import styles from './FarmingSchemes.module.css'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
]

export default function FarmingSchemes({ setView }) {
  const [state, setState] = useState('')
  const [occupation, setOccupation] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFind = async () => {
    if (!state || !occupation.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await findFarmingSchemes(state, occupation.trim())
      setResult(data)
      logToolActivity(
        'farming-schemes',
        `${occupation} in ${state}`,
        data.schemes?.length > 0
          ? `${data.schemes.length} schemes found: ${data.schemes.slice(0, 2).map(s => s.name).join(', ')}`
          : 'No schemes found'
      )
    } catch (err) {
      setError(err.message || 'Failed to fetch schemes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setState('')
    setOccupation('')
    setResult(null)
    setError('')
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => setView('kisan-rath')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Government Schemes</h1>
        <p className={styles.subtitle}>Tell us your state and work — AI will find schemes you can apply for</p>
      </div>

      {!result && (
        <div className={styles.card}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Which state are you from?</label>
            <select
              className={styles.select}
              value={state}
              onChange={e => setState(e.target.value)}
              disabled={loading}
            >
              <option value="">Select your state...</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>What do you do? (your work or occupation)</label>
            <input
              className={styles.input}
              placeholder="e.g. Farmer, Fisherman, Weaver, Daily wage worker..."
              value={occupation}
              onChange={e => setOccupation(e.target.value)}
              disabled={loading}
              onKeyDown={e => e.key === 'Enter' && handleFind()}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.findBtn}
            onClick={handleFind}
            disabled={!state || !occupation.trim() || loading}
          >
            {loading ? (
              <><span className={styles.btnSpinner} /> Finding schemes...</>
            ) : (
              '🏛️ Find Schemes'
            )}
          </button>
        </div>
      )}

      {result && (
        <div className={styles.resultBox}>
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.resultTitle}>
                {result.schemes?.length > 0
                  ? `${result.schemes.length} scheme${result.schemes.length > 1 ? 's' : ''} found for ${state}`
                  : 'No schemes found'}
              </p>
              <p className={styles.resultSub}>{occupation} — {state}</p>
            </div>
            <button className={styles.resetBtn} onClick={handleReset}>Search Again</button>
          </div>

          {result.schemes?.length === 0 && (
            <div className={styles.noneBox}>
              <span className={styles.noneIcon}>📭</span>
              <p className={styles.noneTitle}>No active schemes found</p>
              <p className={styles.noneSub}>
                There are currently no specific government schemes for <strong>{occupation}</strong> in <strong>{state}</strong>. Try searching with a broader occupation like "Farmer" or "Small business owner".
              </p>
            </div>
          )}

          {result.schemes?.map((scheme, i) => (
            <div key={i} className={styles.schemeCard}>
              <div className={styles.schemeTop}>
                <div>
                  <p className={styles.schemeName}>{scheme.name}</p>
                  <span className={`${styles.levelBadge} ${scheme.level === 'State' ? styles.stateBadge : styles.centralBadge}`}>
                    {scheme.level || 'Central'}
                  </span>
                </div>
              </div>

              <div className={styles.schemeSection}>
                <p className={styles.schemeLabel}>What you get</p>
                <p className={styles.schemeText}>{scheme.benefit}</p>
              </div>

              {scheme.who_can_apply && (
                <div className={styles.schemeSection}>
                  <p className={styles.schemeLabel}>Who can apply</p>
                  <p className={styles.schemeText}>{scheme.who_can_apply}</p>
                </div>
              )}

              {scheme.how_to_apply && (
                <div className={styles.schemeSection}>
                  <p className={styles.schemeLabel}>How to apply</p>
                  <p className={`${styles.schemeText} ${styles.applyText}`}>{scheme.how_to_apply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
