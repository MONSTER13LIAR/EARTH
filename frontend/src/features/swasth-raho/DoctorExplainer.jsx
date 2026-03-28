import { useState, useRef } from 'react'
import { explainDoctorVisit } from '../../services/featherless'
import { logToolActivity } from '../../services/api'
import styles from './DoctorExplainer.module.css'

export default function DoctorExplainer({ setView }) {
  const lang    = localStorage.getItem('earth_language') || 'en'
  const hi      = lang === 'hi'

  const [memory,   setMemory]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  // ── Speech to text ──────────────────────────────────────
  const startMic = () => {
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = hi ? 'hi-IN' : 'en-IN'
    r.continuous = false
    r.interimResults = false
    r.onstart  = () => setListening(true)
    r.onend    = () => setListening(false)
    r.onerror  = () => setListening(false)
    r.onresult = (e) => {
      const t = e.results[0][0].transcript
      setMemory(prev => prev ? prev + ' ' + t : t)
      setListening(false)
    }
    r.start()
    recognitionRef.current = r
  }

  const stopMic = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!memory.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await explainDoctorVisit(memory)
      setResult(res)
      logToolActivity(
        'doctor-explainer',
        memory.slice(0, 150),
        res.summary ? res.summary.slice(0, 200) : 'Doctor visit explained'
      )
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setMemory(''); setResult(null); setError('') }

  const micSupported = typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

  return (
    <div className={styles.page}>
      {/* Back */}
      <button className={styles.backBtn} onClick={() => setView('swasth-raho')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {result ? (hi ? 'नई जांच' : 'New') : (hi ? 'वापस' : 'Back')}
      </button>

      <div className={styles.header}>
        <span className={styles.headerIcon}>🏥</span>
        <h1 className={styles.title}>{hi ? 'डॉक्टर ने क्या कहा?' : 'Doctor Visit Explainer'}</h1>
        <p className={styles.subtitle}>
          {hi
            ? 'डॉक्टर ने जो कहा, वो जितना याद हो उतना लिखें या बोलें — AI समझाएगा'
            : 'Write or speak what you remember from your doctor visit — even bits and pieces'}
        </p>
      </div>

      {/* Input box */}
      {!result && (
        <div className={styles.inputCard}>
          <textarea
            className={styles.textarea}
            placeholder={hi
              ? 'जैसे: डॉक्टर ने कहा बीपी बढ़ा हुआ है, कोई नमक कम खाना है, और कुछ गोली दी है...'
              : 'e.g. Doctor said my BP is high, told me to eat less salt, gave some tablets...'}
            value={memory}
            onChange={e => setMemory(e.target.value)}
            rows={6}
            disabled={loading}
          />

          <div className={styles.actions}>
            {micSupported && (
              <button
                className={`${styles.micBtn} ${listening ? styles.micActive : ''}`}
                onClick={listening ? stopMic : startMic}
                title={listening ? 'Stop' : 'Speak'}
              >
                {listening ? (
                  <>
                    <span className={styles.micDot} />
                    {hi ? 'सुन रहा है...' : 'Listening...'}
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                    {hi ? 'बोलें' : 'Speak'}
                  </>
                )}
              </button>
            )}

            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!memory.trim() || loading}
            >
              {loading
                ? <><span className={styles.spinner} /> {hi ? 'समझ रहा है...' : 'Thinking...'}</>
                : (hi ? '🔍 समझाएं' : '🔍 Explain')}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* Result */}
      {result && (
        <div className={styles.resultWrap}>

          {result.urgent && (
            <div className={styles.urgentBanner}>
              ⚠️ {hi ? 'इसमें कुछ जरूरी बात लग रही है — डॉक्टर से जल्दी बात करें' : 'This sounds urgent — please follow up with your doctor soon'}
            </div>
          )}

          <div className={styles.card}>
            <p className={styles.cardLabel}>{hi ? 'डॉक्टर ने संभवतः यह कहा' : 'What your doctor likely meant'}</p>
            <p className={styles.summary}>{result.summary}</p>
          </div>

          {result.what_it_means && (
            <div className={styles.card}>
              <p className={styles.cardLabel}>{hi ? 'सरल भाषा में' : 'In simple words'}</p>
              <p className={styles.bodyText}>{result.what_it_means}</p>
            </div>
          )}

          {result.key_points?.length > 0 && (
            <div className={styles.card}>
              <p className={styles.cardLabel}>{hi ? 'मुख्य बातें' : 'Key points'}</p>
              <ul className={styles.pointList}>
                {result.key_points.map((p, i) => (
                  <li key={i} className={styles.pointItem}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {result.follow_up && (
            <div className={`${styles.card} ${styles.followCard}`}>
              <p className={styles.cardLabel}>{hi ? 'अब क्या करें' : 'What to do next'}</p>
              <p className={styles.bodyText}>{result.follow_up}</p>
            </div>
          )}

          <button className={styles.resetBtn} onClick={reset}>
            {hi ? '+ नई बात लिखें' : '+ Enter another visit'}
          </button>
        </div>
      )}
    </div>
  )
}
