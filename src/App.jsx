import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Cards from './components/Cards'
import WelcomeGuide from './components/WelcomeGuide'
import EntryOverlay from './components/EntryOverlay'
import Tools from './components/Tools'
import History from './components/History'
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
      case 'home':
      default:
        return (
          <>
            <Hero />
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
