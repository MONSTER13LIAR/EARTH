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
import Chatbot from './features/chatbot/Chatbot'
import SwasthRaho from './features/swasth-raho/SwasthRaho'
import SymptomChecker from './features/swasth-raho/SymptomChecker'
import DoctorExplainer from './features/swasth-raho/DoctorExplainer'

export default function App() {
  const [hasEntered, setHasEntered] = useState(false)
  const [view, setView] = useState('home')
  const [language, setLanguage] = useState(localStorage.getItem('earth_language') || 'en')
  const [pendingOcrFile, setPendingOcrFile] = useState(null)

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
        return <Tools setView={setView} />
      case 'swasth-raho':
        return <SwasthRaho setView={setView} onOcrFile={(file) => { setPendingOcrFile(file); setView('chatbot') }} />
      case 'symptom-checker':
        return <SymptomChecker setView={setView} />
      case 'doctor-explainer':
        return <DoctorExplainer setView={setView} />
      case 'history':
        return <History />
      case 'about':
        return <AboutUs />
      case 'chatbot':
        return <Chatbot ocrFile={pendingOcrFile} onOcrFileClear={() => setPendingOcrFile(null)} />
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
            <div style={{ background: '#000', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 8vw, 6rem)',
                fontWeight: '900',
                color: 'white',
                textAlign: 'center',
                margin: 'clamp(40px, 8vw, 80px) auto clamp(20px, 4vw, 40px) auto',
                letterSpacing: 'clamp(2px, 1vw, 8px)',
                textTransform: 'uppercase',
                padding: '0 16px',
              }}>The Problems</h2>
            </div>
            <Cards />
            {hasEntered && <WelcomeGuide language={language} />}
          </>
        )
    }
  }

  return (
    <>
      {!hasEntered && <EntryOverlay onEnter={(lang) => { setLanguage(lang); setHasEntered(true) }} />}
      <Navbar setView={setView} />
      {renderView()}
      {view !== 'chatbot' && (
        <ChatbotBar onNavigate={() => setView('chatbot')} />
      )}
    </>
  )
}
