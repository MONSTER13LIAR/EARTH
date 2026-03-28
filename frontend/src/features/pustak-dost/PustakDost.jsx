import styles from './PustakDost.module.css'

const cards = [
  {
    icon: '📚',
    title: 'Textbook Simplifier',
    desc: 'Paste a chapter or topic from your textbook and get a simple, clear explanation — in Hindi or English.',
    action: 'textbook',
  },
  {
    icon: '🗺️',
    title: 'Career Roadmap',
    desc: 'Tell us your class, interests, and goals — get a step-by-step career path and what to study next.',
    action: 'career',
  },
  {
    icon: '🏛️',
    title: 'Scheme & Job Finder',
    desc: 'Find government scholarships, skill programs, and job opportunities you are eligible for right now.',
    action: 'scheme',
  },
]

export default function PustakDost({ setView }) {
  const handleCardClick = (card) => {
    if (card.action === 'textbook') setView('textbook-simplifier')
    if (card.action === 'career')   setView('career-roadmap')
    if (card.action === 'scheme')   setView('scheme-finder')
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => setView('tools')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Pustak Dost</h1>
        <p className={styles.subtitle}>Your education and career companion</p>
      </div>

      <div className={styles.cardGrid}>
        {cards.map((card, i) => (
          <div
            key={i}
            className={styles.card}
            onClick={() => handleCardClick(card)}
          >
            <div className={styles.cardGlow} />
            <span className={styles.icon}>{card.icon}</span>
            <h2 className={styles.cardTitle}>{card.title}</h2>
            <p className={styles.cardDesc}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
