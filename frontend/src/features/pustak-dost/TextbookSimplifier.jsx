import { useRef, useState } from 'react'
import { extractTextFromImage } from '../../hooks/useOCR'
import { explainTextbook } from '../../services/featherless'
import styles from './TextbookSimplifier.module.css'

function isHindiText(text) {
  // Count Devanagari chars vs total non-space chars.
  // Only call it Hindi if at least 25% of characters are Devanagari —
  // prevents stray OCR noise on English pages from triggering Hindi mode.
  const nonSpace = text.replace(/\s/g, '')
  if (!nonSpace.length) return false
  const devanagari = (nonSpace.match(/[\u0900-\u097F]/g) || []).length
  return devanagari / nonSpace.length >= 0.25
}

function speak(text, lang, onEnd) {
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
  utt.rate = 0.88
  utt.onend = onEnd
  utt.onerror = onEnd
  window.speechSynthesis.speak(utt)
}

export default function TextbookSimplifier({ setView }) {
  const fileInputRef = useRef(null)
  const [step, setStep] = useState('upload') // upload | scanning | confirm | loading | result
  const [ocrText, setOcrText] = useState('')
  const [outputLang, setOutputLang] = useState('en')
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState('')
  const [speaking, setSpeaking] = useState(false)

  const runExplain = async (text, lang) => {
    setStep('loading')
    setError('')
    try {
      const result = await explainTextbook(text, lang)
      setExplanation(result)
      setStep('result')
      speak(result, lang, () => setSpeaking(false))
      setSpeaking(true)
    } catch (err) {
      setError(err.message || 'AI explanation failed. Please try again.')
      setStep('upload')
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setStep('scanning')
    setError('')

    try {
      const text = await extractTextFromImage(file)
      if (!text.trim()) {
        setError('No text found in the image. Please try a clearer photo.')
        setStep('upload')
        return
      }
      setOcrText(text)

      if (isHindiText(text)) {
        setOutputLang('hi')
        await runExplain(text, 'hi')
      } else {
        setStep('confirm')
      }
    } catch (err) {
      setError(err.message || 'Could not read the image. Please try again.')
      setStep('upload')
    }
  }

  const handleConfirm = (lang) => {
    setOutputLang(lang)
    runExplain(ocrText, lang)
  }

  const handleStopSpeak = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  const handleReset = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setStep('upload')
    setOcrText('')
    setExplanation('')
    setError('')
  }

  const handleBack = () => {
    window.speechSynthesis.cancel()
    setView('pustak-dost')
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={handleBack}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Textbook Simplifier</h1>
        <p className={styles.subtitle}>Upload a page — AI will explain it in simple language</p>
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
            <span className={styles.uploadIcon}>📸</span>
            <p className={styles.uploadText}>Tap to upload a textbook page photo</p>
            <p className={styles.uploadSub}>Hindi or English — any subject</p>
          </div>
        </>
      )}

      {/* SCANNING */}
      {step === 'scanning' && (
        <div className={styles.statusBox}>
          <div className={styles.spinner} />
          <p className={styles.statusText}>Reading text from your image...</p>
        </div>
      )}

      {/* LANGUAGE CONFIRM (English detected) */}
      {step === 'confirm' && (
        <div className={styles.confirmBox}>
          <span className={styles.confirmIcon}>🌐</span>
          <p className={styles.confirmHeading}>English text detected</p>
          <p className={styles.confirmSub}>Which language do you want the explanation in?</p>
          <div className={styles.langBtns}>
            <button className={styles.langBtn} onClick={() => handleConfirm('en')}>
              English
            </button>
            <button className={`${styles.langBtn} ${styles.langBtnHindi}`} onClick={() => handleConfirm('hi')}>
              हिंदी
            </button>
          </div>
        </div>
      )}

      {/* AI LOADING */}
      {step === 'loading' && (
        <div className={styles.statusBox}>
          <div className={styles.spinner} />
          <p className={styles.statusText}>AI is simplifying the text...</p>
        </div>
      )}

      {/* RESULT */}
      {step === 'result' && (
        <div className={styles.resultBox}>
          <div className={styles.resultHeader}>
            <span className={styles.resultLabel}>✨ Simplified Explanation</span>
            <div className={styles.resultActions}>
              <button
                className={`${styles.speakBtn} ${speaking ? styles.speakBtnActive : ''}`}
                onClick={speaking ? handleStopSpeak : () => { speak(explanation, outputLang, () => setSpeaking(false)); setSpeaking(true) }}
              >
                {speaking ? '⏹ Stop' : '🔊 Listen'}
              </button>
              <button className={styles.resetBtn} onClick={handleReset}>
                Try Another
              </button>
            </div>
          </div>
          <p className={styles.resultText}>{explanation}</p>
        </div>
      )}
    </div>
  )
}
