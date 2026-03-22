import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Cards from './components/Cards'
import WelcomeGuide from './components/WelcomeGuide'
import EntryOverlay from './components/EntryOverlay'
import Tools from './components/Tools'
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

  return (
    <>
      {!hasEntered && <EntryOverlay onEnter={() => setHasEntered(true)} />}
      <Navbar setView={setView} />
      {view === 'home' ? (
        <>
          <Hero />
          <Marquee />
          <Cards />
          {hasEntered && <WelcomeGuide />}
        </>
      ) : (
        <Tools />
      )}
      <ChatbotBar />
    </>
  )
}
