import { useEffect, useState } from 'react'
import styles from './WelcomeGuide.module.css'

export default function WelcomeGuide() {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  const updatePosition = () => {
    const toolsBtn = document.getElementById('nav-tools')
    if (!toolsBtn) return
    const rect = toolsBtn.getBoundingClientRect()
    if (rect.width === 0) return
    // SVG is 100px tall on desktop, 50px on mobile (via CSS media query).
    // Arrow tip sits at y=2 in a 0-24 viewBox, so offset = (2/24) * renderedHeight.
    const svgHeight = window.innerWidth > 768 ? 100 : 50
    const tipOffset = (2 / 24) * svgHeight
    setPosition({
      left: rect.left + rect.width / 2,
      top: rect.bottom - tipOffset
    })
  }

  useEffect(() => {
    const speak = () => {
      const msg = new SpeechSynthesisUtterance()
      msg.text = "Welcome to EARTH. Your rural companion app. Please select your tool to get started."
      msg.lang = "hi-IN"
      msg.rate = 0.8
      msg.pitch = 1
      window.speechSynthesis.speak(msg)
    }

    const timer = setTimeout(() => {
      const toolsBtn = document.getElementById('nav-tools')
      if (toolsBtn) {
        updatePosition()
        setShow(true)
        speak()
      }
    }, 3000)

    // Debounced resize — wait for layout to settle before recalculating
    let resizeTimer
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(updatePosition, 150)
    }
    window.addEventListener('resize', handleResize)

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
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
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
