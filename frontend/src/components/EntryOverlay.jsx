import { useState } from 'react'
import styles from './EntryOverlay.module.css'

export default function EntryOverlay({ onEnter }) {
  const [isFading, setIsFading] = useState(false)

  const handleEnter = () => {
    // Request microphone permission at entry
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(err => console.log(err));

    // Request location permission at entry
    navigator.geolocation.getCurrentPosition(
      () => {},
      (err) => console.log(err)
    );

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
