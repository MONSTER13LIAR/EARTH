import styles from './Marquee.module.css'

export default function Marquee() {
  const cards = Array.from({ length: 6 }, (_, i) => `Card ${i + 1}`)
  
  // Duplicate the list for a seamless loop
  const displayCards = [...cards, ...cards]

  return (
    <div className={styles.marqueeWrapper}>
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
