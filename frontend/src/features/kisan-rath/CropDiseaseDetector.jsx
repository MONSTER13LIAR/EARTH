import { useRef, useState } from 'react'
import { detectCropDisease } from '../../services/featherless'
import { logToolActivity } from '../../services/api'
import styles from './CropDiseaseDetector.module.css'

const SEVERITY_CONFIG = {
  Healthy:  { label: 'Healthy',  color: styles.severityHealthy },
  Mild:     { label: 'Mild',     color: styles.severityMild },
  Moderate: { label: 'Moderate', color: styles.severityModerate },
  Severe:   { label: 'Severe',   color: styles.severitySevere },
}

function speakText(text, onEnd) {
  window.speechSynthesis.cancel()
  const lang = localStorage.getItem('earth_language') || 'en'
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
  utt.rate = 0.88
  utt.onend = onEnd
  utt.onerror = onEnd
  window.speechSynthesis.speak(utt)
}

export default function CropDiseaseDetector({ setView }) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [cropName, setCropName] = useState('')
  const [soilType, setSoilType] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [speaking, setSpeaking] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  const handleAnalyse = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await detectCropDisease(selectedFile, cropName, soilType)
      setResult(data)
      logToolActivity(
        'crop-disease',
        cropName ? `Crop: ${cropName}` : 'Unknown crop',
        `${data.disease} — ${data.severity}${data.cause ? ' | ' + data.cause.slice(0, 80) : ''}`
      )
      // Auto-speak disease + cause
      const spokenText = [
        data.disease !== 'Healthy'
          ? `Disease detected: ${data.disease}. Severity: ${data.severity}.`
          : 'Your crop looks healthy.',
        data.cause,
        'Treatment: ' + (data.treatment || []).join('. '),
      ].filter(Boolean).join(' ')
      speakText(spokenText, () => setSpeaking(false))
      setSpeaking(true)
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPreview(null)
    setSelectedFile(null)
    setCropName('')
    setSoilType('')
    setResult(null)
    setError('')
  }

  const handleListenResult = () => {
    if (!result) return
    const text = [
      result.disease !== 'Healthy' ? `Disease: ${result.disease}. Severity: ${result.severity}.` : 'Your crop is healthy.',
      result.cause,
      'Treatment steps: ' + (result.treatment || []).join('. '),
      'Prevention: ' + (result.prevention || []).join('. '),
    ].filter(Boolean).join(' ')
    speakText(text, () => setSpeaking(false))
    setSpeaking(true)
  }

  const severityConfig = result ? (SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.Moderate) : null

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => { window.speechSynthesis.cancel(); setView('kisan-rath') }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Crop Disease Detector</h1>
        <p className={styles.subtitle}>Upload a photo — AI will diagnose and suggest treatment</p>
      </div>

      {/* UPLOAD + FORM */}
      {!result && (
        <div className={styles.card}>
          {/* Photo area */}
          <div
            className={`${styles.uploadBox} ${preview ? styles.uploadBoxFilled : ''}`}
            onClick={() => !preview && fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {preview ? (
              <img src={preview} alt="Crop preview" className={styles.preview} />
            ) : (
              <>
                <span className={styles.uploadIcon}>🌿</span>
                <p className={styles.uploadText}>Tap to upload a photo of your crop</p>
                <p className={styles.uploadSub}>Leaf, stem, fruit — any part showing the problem</p>
              </>
            )}
          </div>

          {preview && (
            <button className={styles.changePhotoBtn} onClick={() => fileInputRef.current.click()}>
              Change Photo
            </button>
          )}

          {/* Optional fields */}
          <div className={styles.optionalSection}>
            <p className={styles.optionalLabel}>Optional — helps the AI be more accurate</p>
            <div className={styles.fields}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>What crop is this?</label>
                <input
                  className={styles.input}
                  placeholder="e.g. Wheat, Tomato, Rice..."
                  value={cropName}
                  onChange={e => setCropName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>What soil do you use?</label>
                <input
                  className={styles.input}
                  placeholder="e.g. Black soil, Sandy, Clay, Loamy..."
                  value={soilType}
                  onChange={e => setSoilType(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.analyseBtn}
            onClick={handleAnalyse}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <><span className={styles.btnSpinner} /> Analysing crop...</>
            ) : (
              '🔍 Detect Disease'
            )}
          </button>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className={styles.resultBox}>
          {/* Header row */}
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.diseaseName}>{result.disease}</p>
              <span className={`${styles.severityBadge} ${styles[`severity${result.severity}`]}`}>
                {result.severity}
              </span>
            </div>
            <div className={styles.resultActions}>
              <button
                className={`${styles.speakBtn} ${speaking ? styles.speakBtnActive : ''}`}
                onClick={speaking ? () => { window.speechSynthesis.cancel(); setSpeaking(false) } : handleListenResult}
              >
                {speaking ? '⏹ Stop' : '🔊 Listen'}
              </button>
              <button className={styles.resetBtn} onClick={handleReset}>Try Another</button>
            </div>
          </div>

          {/* Preview thumbnail */}
          {preview && <img src={preview} alt="Crop" className={styles.resultThumb} />}

          {/* Urgent warning */}
          {result.urgent && (
            <div className={styles.urgentBanner}>
              ⚠️ Act quickly — this condition can spread to your entire crop if not treated soon.
            </div>
          )}

          {/* Cause */}
          {result.cause && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>🔬 Cause</p>
              <p className={styles.sectionText}>{result.cause}</p>
            </div>
          )}

          {/* Treatment */}
          {result.treatment?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>💊 Treatment</p>
              <ol className={styles.stepList}>
                {result.treatment.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </div>
          )}

          {/* Prevention */}
          {result.prevention?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>🛡️ Prevention</p>
              <ul className={styles.bulletList}>
                {result.prevention.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
