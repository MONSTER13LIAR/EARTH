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

  const cardsData = [
    {
      stat: "83%",
      title: "MEDICATION ERRORS IN RURAL INDIA",
      description: "83.4% of elderly rural patients experience medication-related problems due to illiteracy — they cannot read medicine labels, leading to wrong dosage and fatal errors.",
      sourceText: "PMC Medical Journal, 2021",
      sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8272714/",
    },
    {
      stat: "42%",
      title: "ENGLISH BARRIER IN SCHOOLS",
      description: "42% of rural adolescents cannot comprehend simple English statements despite being enrolled in school — complex English textbooks leave millions of students completely behind.",
      sourceText: "ASER Report, 2023",
      sourceUrl: "https://asercentre.org/aser-2023/",
    },
    {
      stat: "50%+",
      title: "FARMERS TRAPPED IN DEBT",
      description: "Over 50% of rural farmers borrow from informal moneylenders charging 24-60% annual interest. Without awareness of government schemes, generations of farming families stay trapped in debt cycles.",
      sourceText: "Reserve Bank of India, 2021",
      sourceUrl: "https://rbi.org.in/Scripts/AnnualReportPublications.aspx",
    },
    {
      stat: "86%",
      title: "RURAL WOMEN FACE ABUSE SILENTLY",
      description: "86% of women who experience domestic violence never seek help — due to fear, lack of awareness of rights, distrust of local police, and social stigma in rural communities.",
      sourceText: "NFHS-5 National Family Health Survey",
      sourceUrl: "https://mohfw.gov.in/sites/default/files/NFHS-5_Phase-II_0.pdf",
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
      {cardsData.map((card, i) => (
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
