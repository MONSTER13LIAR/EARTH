import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Cards from './components/Cards'
import WelcomeGuide from './components/WelcomeGuide'
import EntryOverlay from './components/EntryOverlay'

export default function App() {
  const [hasEntered, setHasEntered] = useState(false)

  return (
    <>
      {!hasEntered && <EntryOverlay onEnter={() => setHasEntered(true)} />}
      <Navbar />
      <Hero />
      <Marquee />
      <Cards />
      {hasEntered && <WelcomeGuide />}
    </>
  )
}
