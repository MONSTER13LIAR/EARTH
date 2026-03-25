import { useMemo, useState } from 'react'
import { symptomChecker, textToSpeech, getCurrentUser } from '../services/api'
import { useVoiceInput } from '../hooks/useVoiceInput'
import AudioPlayer from './earth/AudioPlayer'
import styles from './ChatbotBar.module.css'

function formatSymptomResult(result) {
  if (!result) return ''

  const followUps = Array.isArray(result.followUpQuestions)
    ? result.followUpQuestions.map((q) => `• ${q}`).join('\n')
    : ''

  return [
    `Possible condition: ${result.condition || 'unknown'}`,
    `Severity: ${result.severity || 'medium'}`,
    `Advice: ${result.advice || 'Rest and stay hydrated.'}`,
    result.needsDoctor ? 'Doctor consultation recommended.' : 'Home care is currently reasonable.',
    followUps ? `\nFollow-up questions:\n${followUps}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function buildSpeechText(result) {
  if (!result) return ''

  return [
    `Possible condition ${result.condition || 'unclear'}`,
    `Severity ${result.severity || 'medium'}`,
    result.advice || 'Rest and stay hydrated',
    result.needsDoctor ? 'Please consult a doctor soon.' : 'You may continue home care for now.',
  ]
    .join('. ')
    .slice(0, 320)
}

export default function ChatbotBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState(null)
  const [audioUrl, setAudioUrl] = useState('')

  const { isRecording, isProcessing, startRecording, stopAndTranscribe, error: voiceError } = useVoiceInput()

  const user = getCurrentUser()
  const outputText = useMemo(() => formatSymptomResult(response), [response])

  const handleSend = async () => {
    if (!input.trim()) return
    if (!user) {
      setError('Please login from the navbar before using AI chat.')
      return
    }

    setLoading(true)
    setError('')
    setAudioUrl('')

    try {
      const aiResult = await symptomChecker({ symptomsText: input.trim() })
      setResponse(aiResult)

      const speechText = buildSpeechText(aiResult)
      if (speechText) {
        const tts = await textToSpeech(speechText)
        if (tts?.audioUrl) {
          setAudioUrl(tts.audioUrl)
        } else {
          setError('Could not generate audio output. Please retry.')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleMic = async () => {
    setError('')

    if (!user) {
      setError('Please login from the navbar before using microphone input.')
      return
    }

    if (!isRecording) {
      await startRecording()
      return
    }

    const transcript = await stopAndTranscribe()
    if (transcript) {
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }
  }

  return (
    <>
      <button className={styles.fab} onClick={() => setIsOpen((v) => !v)}>
        {isOpen ? '✕' : 'AI'}
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h3>EARTH Assistant</h3>
            <span>Voice-first personal health companion</span>
          </div>

          {!user && <p className={styles.authHint}>Login required. Use navbar Login/Sign up first.</p>}

          <div className={styles.outputBox}>
            {loading ? (
              <p className={styles.loading}>AI is analyzing your input...</p>
            ) : outputText ? (
              <pre className={styles.outputText}>{outputText}</pre>
            ) : (
              <p className={styles.placeholder}>Ask a health question to get guided advice.</p>
            )}
          </div>

          <AudioPlayer audioUrl={audioUrl} autoPlay />

          {(error || voiceError) && (
            <div className={styles.errorBox}>
              <p>{error || voiceError}</p>
              <button onClick={handleSend}>Retry</button>
            </div>
          )}

          <div className={styles.inputRow}>
            <button
              className={`${styles.micButton} ${isRecording ? styles.recording : ''}`}
              onClick={handleMic}
              disabled={isProcessing || loading}
            >
              {isRecording ? 'Stop' : 'Mic'}
            </button>

            <input
              type='text'
              className={styles.chatInput}
              placeholder='Describe your symptom...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleSend()
                }
              }}
            />

            <button className={styles.sendButton} onClick={handleSend} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
