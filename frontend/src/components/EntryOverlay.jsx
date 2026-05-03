import { useRef, useState } from 'react'
import styles from './EntryOverlay.module.css'

// stage: 'start' | 'lang' | 'fading'
export default function EntryOverlay({ onEnter }) {
  const [stage, setStage] = useState('start')
  const [selected, setSelected] = useState(null)   // 'hi' | 'en' | null

  // Refs so timers can read current values without stale closures
  const stageRef       = useRef('start')

  const enterApp = (lang) => {
    localStorage.setItem('earth_language', lang)
    stageRef.current = 'fading'
    setStage('fading')
    setTimeout(() => onEnter(lang), 800)
  }

  const selectLang = (lang) => {
    setSelected(lang)
  }

  const handleStart = () => {
    stageRef.current = 'lang'
    setStage('lang')
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

        {stage === 'lang' && (
          <div className={styles.langModal}>
            <p className={styles.langPrompt}>Choose your language / भाषा चुनें</p>

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
