import styles from './ChatbotBar.module.css'

export default function ChatbotBar() {
  return (
    <div className={styles.chatbotBar}>
      <button className={styles.micButton}>
        <svg className={styles.micIcon} viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </button>
      <input 
        type="text" 
        className={styles.chatInput} 
        placeholder="Apni samasya batayein... (Tell us your problem)" 
      />
      <button className={styles.sendButton}>
        <svg className={styles.sendIcon} viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  )
}
