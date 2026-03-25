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
import { clearAuthSession, fetchMe, getCurrentUser } from './services/api'

export default function App() {
  const [hasEntered, setHasEntered] = useState(false)
  const [view, setView] = useState('home')
  const [currentUser, setCurrentUser] = useState(getCurrentUser())

  useEffect(() => {
    if (!hasEntered) {
      document.body.classList.add('animations-paused')
    } else {
      document.body.classList.remove('animations-paused')
    }
  }, [hasEntered])

  useEffect(() => {
    let mounted = true

    const bootstrapAuth = async () => {
      try {
        const me = await fetchMe()
        if (mounted) {
          setCurrentUser(me.user)
        }
      } catch {
        clearAuthSession()
        if (mounted) {
          setCurrentUser(null)
        }
      }
    }

    if (currentUser) {
      void bootstrapAuth()
    }

    return () => {
      mounted = false
    }
  }, [])

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
      <Navbar
        setView={setView}
        currentUser={currentUser}
        onAuthSuccess={setCurrentUser}
        onLogout={() => setCurrentUser(null)}
      />
      {renderView()}
      <ChatbotBar />
    </>
  )
}
