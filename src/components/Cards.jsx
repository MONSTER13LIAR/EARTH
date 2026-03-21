import { useEffect, useRef } from 'react'
import styles from './Cards.module.css'

export default function Cards() {
  const containerRef = useRef(null)

  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible)
        } else {
          entry.target.classList.remove(styles.visible)
        }
      })
    }, observerOptions)

    const cards = containerRef.current.querySelectorAll(`.${styles.card}`)
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.card} style={{ '--index': 0 }}>
        <span className={styles.number}>1</span>
      </div>
      <div className={styles.card} style={{ '--index': 1 }}>
        <span className={styles.number}>2</span>
      </div>
      <div className={styles.card} style={{ '--index': 2 }}>
        <span className={styles.number}>3</span>
      </div>
    </div>
  )
}
