import { useEffect, useRef } from 'react'
import styles from './Marquee.module.css'

export default function Marquee() {
  const wrapperRef = useRef(null)
  
  const cardsData = [
    { bold: "Get your cure at home", tool: "Swasth Raho" },
    { bold: "Understand your doctor's advice", tool: "Swasth Raho" },
    { bold: "Know your crop, save your harvest", tool: "Kisan Rath" },
    { bold: "Never get trapped in a loan again", tool: "Kisan Rath" },
    { bold: "Learn in your own language", tool: "Pustak Dost" },
    { bold: "Know your rights as a woman", tool: "Shakti" },
  ]

  const displayCards = [...cardsData, ...cardsData]

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
        {displayCards.map((card, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.boldText}>{card.bold}</div>
            <div className={styles.toolName}>{card.tool}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
