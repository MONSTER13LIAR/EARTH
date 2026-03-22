import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Cards from './components/Cards'
import WelcomeGuide from './components/WelcomeGuide'
import EntryOverlay from './components/EntryOverlay'
import Tools from './components/Tools'
import History from './components/History'
import AboutUs from './components/AboutUs'
import ChatbotBar from './components/ChatbotBar'

export default function App() {
  const [hasEntered, setHasEntered] = useState(false)
  const [view, setView] = useState('home')

  useEffect(() => {
    if (!hasEntered) {
      document.body.classList.add('animations-paused')
    } else {
      document.body.classList.remove('animations-paused')
    }
  }, [hasEntered])

  const renderView = () => {
    switch(view) {
      case 'tools':
        return <Tools />
      case 'history':
        return <History />
      case 'about':
        return <AboutUs />
      case 'home':
      default:
        return (
          <>
            <Hero />
            <div style={{
              width: '100%',
              height: '150px',
              background: 'linear-gradient(to bottom, #f5f5f5 0%, #d0d0d0 20%, #808080 50%, #2a2a2a 80%, #000000 100%)',
              pointerEvents: 'none',
              margin: 0,
              padding: 0,
              display: 'block',
              border: 'none',
              outline: 'none',
            }} />
            <Marquee />
            <Cards />
            {hasEntered && <WelcomeGuide />}
          </>
        )
    }
  }

  return (
    <>
      {!hasEntered && <EntryOverlay onEnter={() => setHasEntered(true)} />}
      <Navbar setView={setView} />
      {renderView()}
      <ChatbotBar />
    </>
  )
}
