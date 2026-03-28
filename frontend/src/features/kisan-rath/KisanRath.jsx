import styles from './KisanRath.module.css'

const cards = [
  {
    icon: '🌿',
    title: 'Crop Disease Detector',
    desc: 'Upload a photo of your crop and AI will identify the disease, cause, and best treatment to save your harvest.',
    action: 'crop-disease',
  },
  {
    icon: '📄',
    title: 'Loan Document Reader',
    desc: 'Upload or describe your loan document — understand interest rates, hidden terms, and whether it is safe to sign.',
    action: 'loan-reader',
  },
  {
    icon: '🏛️',
    title: 'Government Schemes',
    desc: 'Find farming subsidies, crop insurance, and government support programs you are eligible for right now.',
    action: 'schemes',
  },
]

export default function KisanRath({ setView }) {
  const handleCardClick = (card) => {
    if (card.action === 'crop-disease') setView('crop-disease')
    if (card.action === 'loan-reader')  setView('loan-reader')
    if (card.action === 'schemes')      setView('farming-schemes')
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
        <h1 className={styles.title}>Kisan Rath</h1>
        <p className={styles.subtitle}>Your complete farming companion</p>
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
