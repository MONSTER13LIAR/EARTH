import { useEffect, useRef } from 'react'
import styles from './Marquee.module.css'

export default function Marquee() {
  const wrapperRef = useRef(null)
  const cards = Array.from({ length: 6 }, (_, i) => `Card ${i + 1}`)
  const displayCards = [...cards, ...cards]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.marqueeWrapper} ref={wrapperRef}>
      <div className={styles.track}>
        {displayCards.map((text, index) => (
          <div key={index} className={styles.card}>
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}
