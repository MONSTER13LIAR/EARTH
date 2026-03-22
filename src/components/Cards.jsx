import { useEffect, useRef, useMemo } from 'react'
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

  const particles = useMemo(() => (
    Array.from({ length: 60 }, (_, i) => {
      const tiny = Math.random() < 0.5
      return {
        id: i,
        bottom: Math.random() * 200,
        left: Math.random() * 100,
        size: tiny ? Math.random() * 1 + 1 : Math.random() * 2 + 3,
        opacity: Math.random() * 0.6 + 0.2,
        duration: Math.random() * 3 + 2,
        delay: -(Math.random() * 4),
        drift: (Math.random() * 60 - 30).toFixed(1),
      }
    })
  ), [])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.background = `radial-gradient(
      circle 200px at ${x}px ${y}px,
      rgba(124, 58, 237, 0.25) 0%,
      rgba(124, 58, 237, 0.08) 40%,
      transparent 70%
    ), #0d0f1f`
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.background = ''
  }

  return (
    <div className={styles.container} ref={containerRef}>
      {cards.map((card, i) => (
        <div
          key={i}
          className={styles.card}
          style={{ '--index': i }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
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
      <div className={styles.glowArea}>
        <div className={styles.glowBg} />
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              position: 'absolute',
              bottom: `${p.bottom}px`,
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `rgba(124, 58, 237, ${p.opacity})`,
              animation: `floatUp ${p.duration}s ease-in infinite`,
              animationDelay: `${p.delay}s`,
              '--drift': `${p.drift}px`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
