import { useRef, useState } from 'react'
import { extractTextFromImage } from '../../hooks/useOCR'
import { analyseLoanDocument } from '../../services/featherless'
import { logToolActivity } from '../../services/api'
import styles from './LoanReader.module.css'

const VERDICT_CONFIG = {
  SAFE:      { label: 'Safe to Sign',        cls: 'verdictSafe',      icon: '✅' },
  RISKY:     { label: 'Risky — Read Carefully', cls: 'verdictRisky', icon: '⚠️' },
  DANGEROUS: { label: 'Do NOT Sign',          cls: 'verdictDangerous', icon: '🚫' },
}

export default function LoanReader({ setView }) {
  const fileInputRef = useRef(null)
  const [step, setStep] = useState('upload') // upload | scanning | loading | result
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setError('')
    setResult(null)
    setStep('scanning')

    try {
      const text = await extractTextFromImage(file)
      if (!text.trim()) {
        setError('No text found in the image. Please try a clearer photo.')
        setStep('upload')
        return
      }
      setStep('loading')
      const data = await analyseLoanDocument(text)
      setResult(data)
      setStep('result')
      logToolActivity(
        'loan-reader',
        'Loan document uploaded',
        `Verdict: ${data.verdict}${data.summary ? ' | ' + data.summary.slice(0, 100) : ''}`
      )
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStep('upload')
    }
  }

  const handleReset = () => {
    setStep('upload')
    setResult(null)
    setError('')
  }

  const verdict = result ? (VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.RISKY) : null

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => setView('kisan-rath')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Loan Document Reader</h1>
        <p className={styles.subtitle}>Upload any document — AI will explain it and flag hidden traps</p>
      </div>

      {/* UPLOAD */}
      {step === 'upload' && (
        <>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.uploadBox} onClick={() => fileInputRef.current.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <span className={styles.uploadIcon}>📄</span>
            <p className={styles.uploadText}>Tap to upload a photo of your document</p>
            <p className={styles.uploadSub}>Loan agreement, contract, lease, any legal paper</p>
          </div>
        </>
      )}

      {/* SCANNING */}
      {step === 'scanning' && (
        <div className={styles.statusBox}>
          <div className={styles.spinner} />
          <p className={styles.statusText}>Reading text from document...</p>
        </div>
      )}

      {/* AI LOADING */}
      {step === 'loading' && (
        <div className={styles.statusBox}>
          <div className={styles.spinner} />
          <p className={styles.statusText}>AI is analysing the document...</p>
        </div>
      )}

      {/* RESULT */}
      {step === 'result' && result && (
        <div className={styles.resultWrap}>

          {/* Verdict banner */}
          <div className={`${styles.verdictBanner} ${styles[verdict.cls]}`}>
            <span className={styles.verdictIcon}>{verdict.icon}</span>
            <span className={styles.verdictLabel}>{verdict.label}</span>
          </div>

          {/* Summary */}
          <div className={styles.card}>
            <p className={styles.cardLabel}>📋 What this document says</p>
            <p className={styles.cardText}>{result.summary}</p>
          </div>

          {/* Key terms */}
          {result.key_terms?.length > 0 && (
            <div className={styles.card}>
              <p className={styles.cardLabel}>🔑 Key Terms Explained</p>
              <div className={styles.termList}>
                {result.key_terms.map((t, i) => (
                  <div key={i} className={styles.termRow}>
                    <span className={styles.termName}>{t.term}</span>
                    <span className={styles.termMeaning}>{t.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden traps */}
          <div className={styles.card}>
            <p className={styles.cardLabel}>🪤 Hidden Traps & Red Flags</p>
            {result.traps?.length > 0 ? (
              <div className={styles.trapList}>
                {result.traps.map((t, i) => (
                  <div key={i} className={styles.trapCard}>
                    <p className={styles.trapClause}>"{t.clause}"</p>
                    <p className={styles.trapWarning}>⚠️ {t.warning}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noTraps}>✅ No hidden traps found in this document.</p>
            )}
          </div>

          <button className={styles.resetBtn} onClick={handleReset}>Scan Another Document</button>
        </div>
      )}
    </div>
  )
}
