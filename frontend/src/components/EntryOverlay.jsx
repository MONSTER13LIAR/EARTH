import { useRef, useState } from 'react'
import styles from './EntryOverlay.module.css'

const HINDI_STATES = new Set([
  'Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Rajasthan',
  'Haryana', 'Himachal Pradesh', 'Uttarakhand', 'Jharkhand',
  'Chhattisgarh', 'Delhi', 'NCT of Delhi',
  'National Capital Territory of Delhi',
])

async function detectState(lat, lon) {
  try {
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' }, signal: controller.signal }
    )
    clearTimeout(tid)
    const data = await res.json()
    return data?.address?.state ?? null
  } catch {
    return null
  }
}

// stage: 'start' | 'detecting' | 'lang' | 'fading'
export default function EntryOverlay({ onEnter }) {
  const [stage, setStage] = useState('start')
  const [hindiPrimary, setHindiPrimary] = useState(false)
  const [selected, setSelected] = useState(null)   // 'hi' | 'en' | null
  const [countdown, setCountdown] = useState(10)

  // Refs so timers can read current values without stale closures
  const stageRef       = useRef('start')
  const hindiRef       = useRef(false)
  const selectedRef    = useRef(null)
  const tickRef        = useRef(null)   // display countdown interval
  const autoRef        = useRef(null)   // auto-confirm timeout

  const enterApp = (lang) => {
    clearInterval(tickRef.current)
    clearTimeout(autoRef.current)
    localStorage.setItem('earth_language', lang)
    stageRef.current = 'fading'
    setStage('fading')
    setTimeout(() => onEnter(lang), 800)
  }

  const selectLang = (lang) => {
    clearTimeout(autoRef.current)
    clearInterval(tickRef.current)
    selectedRef.current = lang
    setSelected(lang)
  }

  const handleStart = () => {
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((s) => s.getTracks().forEach((t) => t.stop()))
      .catch(() => {})

    stageRef.current = 'detecting'
    setStage('detecting')

    // Countdown display — ticks every second from 10
    tickRef.current = setInterval(() => {
      setCountdown((n) => (n > 0 ? n - 1 : 0))
    }, 1000)

    // Auto-confirm Hindi after 10 seconds from Enter press
    autoRef.current = setTimeout(() => {
      if (!hindiRef.current || selectedRef.current) return

      if (stageRef.current === 'lang') {
        // Modal already visible — confirm now
        enterApp('hi')
      } else {
        // Still detecting — wait for modal then give 1s grace so user sees it
        const poll = setInterval(() => {
          if (stageRef.current === 'lang' && !selectedRef.current) {
            clearInterval(poll)
            setTimeout(() => {
              if (!selectedRef.current) enterApp('hi')
            }, 1000)
          }
        }, 100)
      }
    }, 10000)

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const state = await detectState(coords.latitude, coords.longitude)
          const isHindi = state ? HINDI_STATES.has(state) : false
          hindiRef.current = isHindi
          setHindiPrimary(isHindi)
        } catch {
          hindiRef.current = false
          setHindiPrimary(false)
        } finally {
          stageRef.current = 'lang'
          setStage('lang')
        }
      },
      () => {
        hindiRef.current = false
        setHindiPrimary(false)
        stageRef.current = 'lang'
        setStage('lang')
      },
      { timeout: 10000 }
    )
  }

  return (
    <div className={`${styles.overlay} ${stage === 'fading' ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <h1 className={styles.logo}>EARTH</h1>

        {stage === 'start' && (
          <button className={styles.enterBtn} onClick={handleStart}>
            TAP TO ENTER / शुरू करें
          </button>
        )}

        {stage === 'detecting' && (
          <p className={styles.detecting}>Detecting location…</p>
        )}

        {stage === 'lang' && (
          <div className={styles.langModal}>
            <p className={styles.langPrompt}>Choose your language / भाषा चुनें</p>

            {hindiPrimary ? (
              <>
                <button
                  className={`${styles.langPrimary} ${selected === 'hi' ? styles.langSelected : ''}`}
                  onClick={() => selectLang('hi')}
                >
                  हिंदी {!selected && <span className={styles.countdown}>({countdown})</span>}
                </button>
                <button
                  className={`${styles.langSecondary} ${selected === 'en' ? styles.langSelectedSecondary : ''}`}
                  onClick={() => selectLang('en')}
                >
                  English
                </button>
              </>
            ) : (
              <>
                <button
                  className={`${styles.langPrimary} ${selected === 'en' ? styles.langSelected : ''}`}
                  onClick={() => selectLang('en')}
                >
                  English
                </button>
                <button
                  className={`${styles.langSecondary} ${selected === 'hi' ? styles.langSelectedSecondary : ''}`}
                  onClick={() => selectLang('hi')}
                >
                  हिंदी
                </button>
              </>
            )}

            {selected && (
              <button className={styles.confirmBtn} onClick={() => enterApp(selected)}>
                Continue →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
