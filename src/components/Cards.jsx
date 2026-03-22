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

  const cards = [
    {
      stat: '900M+',
      title: 'Rural Indians Underserved',
      description: 'Urban areas constitute just 3% of India yet contribute 70% of GDP — while more than 900 million citizens in rural areas remain underserved and lack basic access to banking, healthcare, and digital services.',
      sourceText: 'PWOnlyIAS — Digital Access in Rural India, 2024',
      sourceUrl: 'https://pwonlyias.com/editorial-analysis/digital-access-in-rural-areas/',
    },
    {
      stat: '31%',
      title: 'Rural Internet Access',
      description: 'Only 31% of rural India uses the internet compared to 67% of urban India. Among the poorest 20% of households, only 8.9% have internet access at all — leaving hundreds of millions completely disconnected.',
      sourceText: 'Oxfam India Inequality Report, 2022',
      sourceUrl: 'https://ruralindiaonline.org/en/library/resource/digital-divide-india-inequality-report-2022/',
    },
    {
      stat: '56%',
      title: 'Women Left Behind',
      description: 'Mobile ownership among rural women stands at just 56% compared to 84% for men. Rural areas are disproportionately affected by digital illiteracy, creating a severe lack of opportunities in health, education and employment for women and girls.',
      sourceText: 'OneYoungIndia Digital Divide Report, 2025',
      sourceUrl: 'https://www.oneyoungindia.com/white-papers/a-critical-look-at-india\'s-digital-divide/shreeyans-sharma',
    },
  ]

  return (
    <div className={styles.container} ref={containerRef}>
      {cards.map((card, i) => (
        <div key={i} className={styles.card} style={{ '--index': i }}>
          <span className={styles.stat}>{card.stat}</span>
          <span className={styles.title}>{card.title}</span>
          <p className={styles.description}>{card.description}</p>
          <a
            className={styles.source}
            href={card.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {card.sourceText}
          </a>
        </div>
      ))}
    </div>
  )
}
