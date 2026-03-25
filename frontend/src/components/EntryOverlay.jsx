import { useState } from 'react'
import styles from './EntryOverlay.module.css'

export default function EntryOverlay({ onEnter }) {
  const [isFading, setIsFading] = useState(false)

  const handleEnter = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop())
      })
      .catch(() => {})

    setIsFading(true)
    setTimeout(() => {
      onEnter()
    }, 800)
  }

  return (
    <div className={`${styles.overlay} ${isFading ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <h1 className={styles.logo}>EARTH</h1>
        <p className={styles.tagline}>Rural AI Health Companion</p>
        <button className={styles.enterBtn} onClick={handleEnter}>
          Enter Experience
        </button>
      </div>
    </div>
  )
}
