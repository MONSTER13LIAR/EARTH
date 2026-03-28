import styles from './Shakti.module.css'

const cards = [
  {
    icon: '⚖️',
    title: 'Know Your Rights',
    desc: 'Understand women\'s legal rights, domestic violence laws, and exactly how to safely report abuse or harassment.',
    action: 'rights',
  },
  {
    icon: '🎓',
    title: 'Scholarships & Schemes',
    desc: 'Find government scholarships, skill programs, and financial support made specifically for women like you.',
    action: 'scholarships',
  },
  {
    icon: '🌸',
    title: 'Women\'s Health Guide',
    desc: 'Get private, judgment-free answers on women\'s health — menstrual health, nutrition, pregnancy, and more.',
    action: 'health',
  },
]

export default function Shakti({ setView }) {
  const handleCardClick = (card) => {
    if (card.action === 'rights')       setView('womens-rights')
    if (card.action === 'scholarships') setView('womens-schemes')
    if (card.action === 'health')       setView('womens-health')
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
        <h1 className={styles.title}>Shakti</h1>
        <p className={styles.subtitle}>Women's safety and empowerment</p>
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
