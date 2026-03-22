import { useEffect, useState } from 'react'
import styles from './WelcomeGuide.module.css'

export default function WelcomeGuide() {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useEffect(() => {
    const speak = () => {
      const msg = new SpeechSynthesisUtterance()
      msg.text = "Welcome to EARTH. Your rural companion app. Please select your tool to get started."
      msg.lang = "hi-IN"
      msg.rate = 0.8
      msg.pitch = 1
      window.speechSynthesis.speak(msg)
    }

    const startGuide = () => {
      const timer = setTimeout(() => {
        const toolsBtn = document.getElementById('nav-tools')
        if (toolsBtn) {
          const rect = toolsBtn.getBoundingClientRect()
          setPosition({
            left: rect.left + rect.width / 2,
            top: rect.bottom + 20
          })
          setShow(true)
          speak()
        }
      }, 5000)
      return timer
    }

    let timer
    if (window.speechSynthesis.getVoices().length > 0) {
      timer = startGuide()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        if (!timer) timer = startGuide()
      }
    }

    // Close when TOOLS button is clicked
    const handleToolsClick = () => {
      setShow(false)
      window.speechSynthesis.cancel()
    }

    const toolsBtn = document.getElementById('nav-tools')
    if (toolsBtn) {
      toolsBtn.addEventListener('click', handleToolsClick)
    }

    return () => {
      clearTimeout(timer)
      if (toolsBtn) {
        toolsBtn.removeEventListener('click', handleToolsClick)
      }
    }
  }, [])

  if (!show) return null

  return (
    <div 
      className={styles.guideOverlay} 
      style={{ left: `${position.left}px`, top: `${position.top}px` }}
    >
      <div className={styles.arrowContainer}>
        <div className={styles.arrowIcon}>
          <svg width="120" height="100" viewBox="0 0 24 24" fill="red">
            <path d="M12 2L2 12h5v10h10V12h5L12 2z" />
          </svg>
        </div>
        <div className={styles.label}>Click here to begin</div>
      </div>
    </div>
  )
}
