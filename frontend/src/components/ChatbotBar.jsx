import { useState } from 'react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import styles from './ChatbotBar.module.css'

export default function ChatbotBar({ onNavigate }) {
  const [input, setInput] = useState('')
  const [toast, setToast] = useState(false)

  const showToast = () => {
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  const handleSend = () => {
    const message = input.trim()
    if (!message) return
    localStorage.setItem('pendingMessage', message)
    setInput('')
    onNavigate?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  const { isListening, startListening, supported } = useSpeechRecognition({
    onResult: (transcript) => {
      setInput(transcript)
      localStorage.setItem('pendingMessage', transcript)
      onNavigate?.()
    },
  })

  const handleMic = () => {
    if (!supported) { showToast(); return }
    startListening()
  }

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: '#333', color: '#fff', padding: '8px 18px', borderRadius: 8,
          fontSize: 13, zIndex: 1100,
        }}>
          Voice not supported on this browser
        </div>
      )}
      <div className={styles.chatbotBar}>
        <button
          className={styles.micButton}
          onClick={handleMic}
          style={{ background: isListening ? '#E53935' : undefined }}
        >
          <svg className={styles.micIcon} viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>
        <input
          type="text"
          className={styles.chatInput}
          placeholder={isListening ? 'Listening...' : 'Apni samasya batayein... (Tell us your problem)'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.sendButton} onClick={handleSend}>
          <svg className={styles.sendIcon} viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </>
  )
}
