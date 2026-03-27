import { useRef } from 'react'
import styles from './SwasthRaho.module.css'

export default function SwasthRaho({ setView, onOcrFile }) {
  const fileInputRef = useRef(null)

  const cards = [
    {
      icon: '💊',
      title: 'Medicine Label Reader',
      desc: 'Scan any medicine label and get a simple explanation — dosage, side effects, and warnings.',
      action: 'medicine',
    },
    {
      icon: '🩺',
      title: 'Symptom Checker',
      desc: 'Describe what you feel and get guidance on what might be wrong and what steps to take next.',
      action: 'symptom',
    },
    {
      icon: '🏥',
      title: 'Doctor Visit Explainer',
      desc: "Upload your doctor's prescription and get it explained in simple language.",
      action: null,
    },
  ]

  const handleCardClick = (card) => {
    if (card.action === 'medicine') fileInputRef.current.click()
    if (card.action === 'symptom')  setView('symptom-checker')
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    onOcrFile(file)   // hand file to App → navigate to chatbot
  }

  return (
    <div className={styles.page}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <button className={styles.backBtn} onClick={() => setView('tools')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Swasth Raho</h1>
        <p className={styles.subtitle}>Your complete rural health companion</p>
      </div>

      <div className={styles.cardGrid}>
        {cards.map((card, i) => (
          <div
            key={i}
            className={`${styles.card} ${card.action ? styles.clickable : ''}`}
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
