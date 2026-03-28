import { useState } from 'react'
import { suggestCareerPaths, generateCareerRoadmap } from '../../services/featherless'
import styles from './CareerRoadmap.module.css'

const GRADES_YOUNG = ['LKG','UKG','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th']
const GRADES_READY = ['12th', 'After 12th']
const TOO_YOUNG = new Set(GRADES_YOUNG)

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

export default function CareerRoadmap({ setView }) {
  const [step, setStep] = useState('grade')
  const [grade, setGrade] = useState('')
  const [marks10, setMarks10] = useState('')
  const [marks12, setMarks12] = useState('')
  const [certificates, setCertificates] = useState('')
  const [certificateDetails, setCertificateDetails] = useState('')
  const [interestInput, setInterestInput] = useState('')
  const [interests, setInterests] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [chosenCareer, setChosenCareer] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [error, setError] = useState('')
  const [speaking, setSpeaking] = useState(false)

  const handleGradeSelect = (g) => {
    setGrade(g)
    setStep(TOO_YOUNG.has(g) ? 'too-young' : 'qualifications')
  }

  const handleAddInterest = () => {
    const trimmed = interestInput.trim()
    if (!trimmed || interests.includes(trimmed) || interests.length >= 5) return
    setInterests(prev => [...prev, trimmed])
    setInterestInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddInterest() }
  }

  const handleGetSuggestions = async () => {
    if (interests.length < 3) { setError('Please add at least 3 interests.'); return }
    setError('')
    setStep('loading-suggest')
    try {
      const result = await suggestCareerPaths({ grade, marks10, marks12, certificates, certificateDetails, interests })
      setSuggestions(result)
      setStep('suggestions')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStep('interests')
    }
  }

  const handleChooseCareer = async (career) => {
    setChosenCareer(career)
    setStep('loading-roadmap')
    setError('')
    try {
      const result = await generateCareerRoadmap({ career: career.title, grade, marks10, marks12, certificates, certificateDetails })
      setRoadmap(result)
      setStep('roadmap')
      if (result.overview) {
        speakText(result.overview, () => setSpeaking(false))
        setSpeaking(true)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStep('suggestions')
    }
  }

  const handleStopSpeak = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  const handleListenRoadmap = () => {
    if (!roadmap) return
    const spokenText = [
      roadmap.overview,
      'Steps: ' + roadmap.steps.join('. '),
      roadmap.timeline ? 'Timeline: ' + roadmap.timeline : '',
      roadmap.salary ? 'Expected salary: ' + roadmap.salary : '',
    ].filter(Boolean).join('. ')
    speakText(spokenText, () => setSpeaking(false))
    setSpeaking(true)
  }

  const handleReset = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setStep('grade')
    setGrade('')
    setMarks10('')
    setMarks12('')
    setCertificates('')
    setCertificateDetails('')
    setInterests([])
    setInterestInput('')
    setSuggestions([])
    setChosenCareer(null)
    setRoadmap(null)
    setError('')
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => { window.speechSynthesis.cancel(); setView('pustak-dost') }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Career Roadmap</h1>
        <p className={styles.subtitle}>Your personalised path to a great career</p>
      </div>

      {/* ── GRADE SELECTION ── */}
      {step === 'grade' && (
        <div className={styles.card}>
          <p className={styles.cardHeading}>Which grade are you in?</p>

          <div className={styles.gradeGrid}>
            {GRADES_YOUNG.map(g => (
              <button key={g} className={styles.gradeBtn} onClick={() => handleGradeSelect(g)}>{g}</button>
            ))}
          </div>

          <div className={styles.gradeDivider} />

          <div className={styles.gradeReady}>
            {GRADES_READY.map(g => (
              <button key={g} className={`${styles.gradeBtn} ${styles.gradeBtnReady}`} onClick={() => handleGradeSelect(g)}>{g}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── TOO YOUNG ── */}
      {step === 'too-young' && (
        <div className={styles.card}>
          <span className={styles.bigIcon}>📚</span>
          <p className={styles.cardHeading}>Keep Studying!</p>
          <p className={styles.cardSub}>
            You are in <strong style={{ color: '#90caf9' }}>{grade}</strong> right now. This tool is designed for students in <strong style={{ color: '#90caf9' }}>12th grade or above</strong>.
            <br /><br />
            Focus on your studies, score well in your boards, and come back when you are in 12th or have completed it — we will find the perfect career for you!
          </p>
          <button className={styles.primaryBtn} onClick={() => setStep('grade')}>← Change Grade</button>
        </div>
      )}

      {/* ── QUALIFICATIONS ── */}
      {step === 'qualifications' && (
        <div className={styles.card}>
          <span className={styles.bigIcon}>📋</span>
          <p className={styles.cardHeading}>Tell us about your academics</p>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Number of certificates or extra courses completed
            </label>
            <input
              className={styles.input}
              type="number"
              min="0"
              placeholder="e.g. 2 — enter 0 if none"
              value={certificates}
              onChange={e => setCertificates(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              What were they for? <span className={styles.optional}>optional</span>
            </label>
            <input
              className={styles.input}
              placeholder="e.g. Typing, MS Office, Spoken English, NCC..."
              value={certificateDetails}
              onChange={e => setCertificateDetails(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              10th board marks <span className={styles.optional}>optional</span>
            </label>
            <input
              className={styles.input}
              placeholder="e.g. 82% or 410/500"
              value={marks10}
              onChange={e => setMarks10(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              12th board marks <span className={styles.optional}>optional</span>
            </label>
            <input
              className={styles.input}
              placeholder="e.g. 76% or 380/500"
              value={marks12}
              onChange={e => setMarks12(e.target.value)}
            />
          </div>

          <button className={styles.primaryBtn} onClick={() => setStep('interests')}>
            Next →
          </button>
        </div>
      )}

      {/* ── INTERESTS ── */}
      {step === 'interests' && (
        <div className={styles.card}>
          <span className={styles.bigIcon}>💡</span>
          <p className={styles.cardHeading}>What are your interests?</p>
          <p className={styles.cardSub}>Add 3 to 5 things you enjoy or want to work in</p>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.interestRow}>
            <input
              className={styles.input}
              placeholder="e.g. Computers, Drawing, Teaching..."
              value={interestInput}
              onChange={e => setInterestInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={interests.length >= 5}
            />
            <button
              className={styles.addBtn}
              onClick={handleAddInterest}
              disabled={!interestInput.trim() || interests.length >= 5}
            >
              Add
            </button>
          </div>

          {interests.length > 0 && (
            <div className={styles.chips}>
              {interests.map((interest, i) => (
                <span key={i} className={styles.chip}>
                  {interest}
                  <button className={styles.chipRemove} onClick={() => setInterests(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
                </span>
              ))}
            </div>
          )}

          <p className={styles.interestCount}>
            {interests.length}/5 added
            {interests.length < 3 && <span className={styles.interestNeed}> — need {3 - interests.length} more</span>}
          </p>

          <button
            className={styles.primaryBtn}
            onClick={handleGetSuggestions}
            disabled={interests.length < 3}
          >
            Find My Best Careers →
          </button>
        </div>
      )}

      {/* ── LOADING SUGGESTIONS ── */}
      {(step === 'loading-suggest') && (
        <div className={styles.statusBox}>
          <div className={styles.spinner} />
          <p className={styles.statusText}>AI is finding the best career paths for you...</p>
        </div>
      )}

      {/* ── SUGGESTIONS ── */}
      {step === 'suggestions' && (
        <div className={styles.suggestWrap}>
          <p className={styles.cardHeading} style={{ textAlign: 'center' }}>Your top career matches</p>
          <p className={styles.cardSub} style={{ textAlign: 'center', marginBottom: 28 }}>Pick the one that excites you most</p>
          <div className={styles.suggestionList}>
            {suggestions.map((s, i) => (
              <div key={i} className={styles.suggestionCard} onClick={() => handleChooseCareer(s)}>
                <span className={styles.suggestionEmoji}>{s.emoji}</span>
                <div className={styles.suggestionText}>
                  <p className={styles.suggestionTitle}>{s.title}</p>
                  <p className={styles.suggestionReason}>{s.reason}</p>
                </div>
                <span className={styles.suggestionArrow}>→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LOADING ROADMAP ── */}
      {step === 'loading-roadmap' && (
        <div className={styles.statusBox}>
          <div className={styles.spinner} />
          <p className={styles.statusText}>Building your personalised roadmap...</p>
        </div>
      )}

      {/* ── ROADMAP ── */}
      {step === 'roadmap' && roadmap && (
        <div className={styles.roadmapBox}>
          <div className={styles.roadmapHeader}>
            <div>
              <p className={styles.roadmapCareer}>{chosenCareer?.emoji} {chosenCareer?.title}</p>
              <span className={styles.resultLabel}>YOUR CAREER ROADMAP</span>
            </div>
            <div className={styles.resultActions}>
              <button
                className={`${styles.speakBtn} ${speaking ? styles.speakBtnActive : ''}`}
                onClick={speaking ? handleStopSpeak : handleListenRoadmap}
              >
                {speaking ? '⏹ Stop' : '🔊 Listen'}
              </button>
              <button className={styles.resetBtn} onClick={handleReset}>Start Over</button>
            </div>
          </div>

          <p className={styles.overviewText}>{roadmap.overview}</p>

          {roadmap.fit_note && (
            <div className={`${styles.fitBadge} ${roadmap.good_fit ? styles.fitGood : styles.fitOk}`}>
              {roadmap.good_fit ? '✅' : '📌'} {roadmap.fit_note}
            </div>
          )}

          {roadmap.steps?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>🗺️ Steps to get there</p>
              <ol className={styles.stepList}>
                {roadmap.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
          )}

          {roadmap.courses?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>📝 Important exams & courses</p>
              <ul className={styles.bulletList}>
                {roadmap.courses.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          <div className={styles.infoStrip}>
            {roadmap.timeline && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>⏱ Timeline</span>
                <span className={styles.infoValue}>{roadmap.timeline}</span>
              </div>
            )}
            {roadmap.salary && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>💰 Expected Salary</span>
                <span className={styles.infoValue}>{roadmap.salary}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
