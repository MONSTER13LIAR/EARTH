import { useState } from 'react'
import styles from './EntryOverlay.module.css'

export default function EntryOverlay({ onEnter }) {
  const [isFading, setIsFading] = useState(false)

  const handleEnter = () => {
    setIsFading(true)
    setTimeout(() => {
      onEnter()
    }, 800) // Match fade out duration
  }

  return (
    <div className={`${styles.overlay} ${isFading ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <h1 className={styles.logo}>EARTH</h1>
        <button className={styles.enterBtn} onClick={handleEnter}>
          TAP TO ENTER / शुरू करें
        </button>
      </div>
    </div>
  )
}
