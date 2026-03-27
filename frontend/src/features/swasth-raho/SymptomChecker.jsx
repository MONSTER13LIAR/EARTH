import { useRef, useState } from 'react'
import { analyseSymptoms } from '../../services/featherless'
import styles from './SymptomChecker.module.css'

// ── Body parts definition ──────────────────────────────────
const PARTS = [
  { id: 'head',        label: 'Head',         shape: 'ellipse', cx:100, cy:34,  rx:27, ry:30 },
  { id: 'neck',        label: 'Neck',         shape: 'rect',    x:88,  y:64,   w:24,  h:18 },
  { id: 'chest',       label: 'Chest',        shape: 'poly',    points:'54,82 146,82 138,148 62,148' },
  { id: 'abdomen',     label: 'Abdomen',      shape: 'rect',    x:62,  y:148,  w:76,  h:52 },
  { id: 'hip',         label: 'Hip / Pelvis', shape: 'rect',    x:60,  y:200,  w:80,  h:30 },
  { id: 'left-arm',    label: 'Left Arm',     shape: 'rect',    x:22,  y:84,   w:30,  h:108 },
  { id: 'right-arm',   label: 'Right Arm',    shape: 'rect',    x:148, y:84,   w:30,  h:108 },
  { id: 'left-hand',   label: 'Left Hand',    shape: 'ellipse', cx:37, cy:206, rx:15, ry:11 },
  { id: 'right-hand',  label: 'Right Hand',   shape: 'ellipse', cx:163,cy:206, rx:15, ry:11 },
  { id: 'left-thigh',  label: 'Left Thigh',   shape: 'rect',    x:62,  y:230,  w:34,  h:66 },
  { id: 'right-thigh', label: 'Right Thigh',  shape: 'rect',    x:104, y:230,  w:34,  h:66 },
  { id: 'left-knee',   label: 'Left Knee',    shape: 'ellipse', cx:79, cy:302, rx:14, ry:9 },
  { id: 'right-knee',  label: 'Right Knee',   shape: 'ellipse', cx:121,cy:302, rx:14, ry:9 },
  { id: 'left-shin',   label: 'Left Shin',    shape: 'rect',    x:65,  y:311,  w:28,  h:64 },
  { id: 'right-shin',  label: 'Right Shin',   shape: 'rect',    x:107, y:311,  w:28,  h:64 },
  { id: 'left-foot',   label: 'Left Foot',    shape: 'ellipse', cx:76, cy:386, rx:22, ry:11 },
  { id: 'right-foot',  label: 'Right Foot',   shape: 'ellipse', cx:124,cy:386, rx:22, ry:11 },
]

// ── SVG Body Diagram ───────────────────────────────────────
function BodyDiagram({ selected, onSelect }) {
  const [hovered, setHovered] = useState(null)

  const renderShape = (p) => {
    const isSelected = selected === p.id
    const isHovered  = hovered  === p.id
    const fill   = isSelected ? 'rgba(139,92,246,0.4)' : isHovered ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.04)'
    const stroke = isSelected ? '#a78bfa' : '#7c3aed'
    const sw     = isSelected ? 2 : 1.2
    const filter = isSelected ? 'url(#glow)' : isHovered ? 'url(#glowSoft)' : 'none'
    const common = { fill, stroke, strokeWidth: sw, filter, cursor: 'pointer' }

    if (p.shape === 'ellipse') return <ellipse key={p.id} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} {...common} />
    if (p.shape === 'rect')    return <rect    key={p.id} x={p.x}   y={p.y}   width={p.w} height={p.h} rx={4} {...common} />
    if (p.shape === 'poly')    return <polygon key={p.id} points={p.points} {...common} />
    return null
  }

  return (
    <svg
      viewBox="0 0 200 400"
      className={styles.bodySvg}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glowSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Face details on head */}
      <circle cx="91" cy="30" r="2.5" fill="#7c3aed" opacity="0.6" />
      <circle cx="109" cy="30" r="2.5" fill="#7c3aed" opacity="0.6" />
      <path d="M 93 42 Q 100 47 107 42" stroke="#7c3aed" strokeWidth="1.2" fill="none" opacity="0.5" />

      {PARTS.map((p) => (
        <g
          key={p.id}
          onClick={() => onSelect(p.id === selected ? null : p.id)}
          onMouseEnter={() => setHovered(p.id)}
          onMouseLeave={() => setHovered(null)}
        >
          {renderShape(p)}
          {/* label on hover/select */}
          {(hovered === p.id || selected === p.id) && (
            <text
              x={p.cx ?? (p.x + p.w / 2)}
              y={(p.cy ?? (p.y + p.h / 2)) + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fill="#e9d5ff"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

// ── Main Component ─────────────────────────────────────────
const STEP = { TYPE: 0, BODY: 1, DESCRIBE: 2, RESULT: 3 }

export default function SymptomChecker({ setView }) {
  const [step,        setStep]       = useState(STEP.TYPE)
  const [type,        setType]       = useState(null)        // 'physical' | 'internal'
  const [bodyPart,    setBodyPart]   = useState(null)
  const [photo,       setPhoto]      = useState(null)
  const [description, setDescription] = useState('')
  const [loading,     setLoading]    = useState(false)
  const [result,      setResult]     = useState(null)
  const [error,       setError]      = useState('')
  const fileRef = useRef(null)
  const lang = localStorage.getItem('earth_language') || 'en'
  const hi   = lang === 'hi'

  const selectedLabel = PARTS.find(p => p.id === bodyPart)?.label || ''

  const handleSubmit = async () => {
    if (!description.trim()) return
    setLoading(true)
    setError('')
    setStep(STEP.RESULT)
    try {
      const res = await analyseSymptoms({ bodyPart: selectedLabel, type, description, imageFile: photo })
      setResult(res)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(STEP.TYPE); setType(null); setBodyPart(null)
    setPhoto(null); setDescription(''); setResult(null); setError('')
  }

  // ── Step 0: Type selection ───────────────────────────────
  if (step === STEP.TYPE) return (
    <div className={styles.page}>
      <BackBtn onClick={() => setView('swasth-raho')} />
      <h2 className={styles.heading}>{hi ? 'लक्षण कैसे हैं?' : 'What kind of symptom?'}</h2>
      <p className={styles.sub}>{hi ? 'नीचे से चुनें' : 'Choose one below'}</p>
      <div className={styles.typeRow}>
        <button className={styles.typeCard} onClick={() => { setType('physical'); setStep(STEP.BODY) }}>
          <span className={styles.typeIcon}>🔴</span>
          <span className={styles.typeTitle}>{hi ? 'शारीरिक / दिखने वाला' : 'Physical / Visible'}</span>
          <span className={styles.typeSub}>{hi ? 'चोट, दाने, सूजन, घाव' : 'Rash, injury, swelling, wound'}</span>
        </button>
        <button className={styles.typeCard} onClick={() => { setType('internal'); setStep(STEP.BODY) }}>
          <span className={styles.typeIcon}>💙</span>
          <span className={styles.typeTitle}>{hi ? 'अंदरूनी / महसूस होना' : 'Internal / Feeling'}</span>
          <span className={styles.typeSub}>{hi ? 'दर्द, बुखार, उल्टी, थकान' : 'Pain, fever, nausea, fatigue'}</span>
        </button>
      </div>
    </div>
  )

  // ── Step 1: Body diagram ─────────────────────────────────
  if (step === STEP.BODY) return (
    <div className={styles.page}>
      <BackBtn onClick={() => setStep(STEP.TYPE)} />
      <h2 className={styles.heading}>{hi ? 'कहाँ तकलीफ है?' : 'Where does it hurt?'}</h2>
      <p className={styles.sub}>{hi ? 'शरीर पर उस जगह पर टैप करें' : 'Tap the body part on the diagram'}</p>

      {type === 'physical' && (
        <div className={styles.photoRow}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) setPhoto(f); e.target.value='' }} />
          <button className={`${styles.photoBtn} ${photo ? styles.photoBtnDone : ''}`}
            onClick={() => fileRef.current.click()}>
            {photo ? `✓ ${hi ? 'फोटो जुड़ी' : 'Photo added'}` : `📷 ${hi ? 'फोटो लगाएं' : 'Add photo'}`}
          </button>
        </div>
      )}

      <BodyDiagram selected={bodyPart} onSelect={setBodyPart} />

      {bodyPart && (
        <p className={styles.selectedPart}>
          {hi ? 'चुना: ' : 'Selected: '}<strong>{selectedLabel}</strong>
        </p>
      )}

      <button className={styles.nextBtn} disabled={!bodyPart}
        onClick={() => setStep(STEP.DESCRIBE)}>
        {hi ? 'आगे →' : 'Continue →'}
      </button>
    </div>
  )

  // ── Step 2: Describe ─────────────────────────────────────
  if (step === STEP.DESCRIBE) return (
    <div className={styles.page}>
      <BackBtn onClick={() => setStep(STEP.BODY)} />
      <h2 className={styles.heading}>{hi ? 'अपनी तकलीफ बताएं' : 'Describe your symptoms'}</h2>
      <p className={styles.sub}>
        {hi ? `${selectedLabel} — यह कब से है? कैसा लग रहा है? कैसे हुआ?`
             : `${selectedLabel} — Since when? How does it feel? How did it happen?`}
      </p>
      <textarea
        className={styles.textarea}
        placeholder={hi
          ? 'जैसे: कल से जलन हो रही है, लाल दाने निकले हैं, साबुन लगाने के बाद हुआ...'
          : 'e.g. burning since yesterday, red spots appeared, started after using soap...'}
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={5}
      />
      <button className={styles.nextBtn} disabled={!description.trim()}
        onClick={handleSubmit}>
        {hi ? '🔍 जांचें' : '🔍 Analyse'}
      </button>
    </div>
  )

  // ── Step 3: Result ───────────────────────────────────────
  const verdictColor = { URGENT: '#ef4444', SEE_DOCTOR: '#f59e0b', HOME_CARE: '#22c55e' }
  const verdictLabel = {
    URGENT:     hi ? '⚠️ तुरंत डॉक्टर के पास जाएं' : '⚠️ See a doctor immediately',
    SEE_DOCTOR: hi ? '🏥 जल्दी डॉक्टर को दिखाएं' : '🏥 See a doctor soon',
    HOME_CARE:  hi ? '🏠 घर पर ठीक हो सकते हैं' : '🏠 Can manage at home',
  }

  return (
    <div className={styles.page}>
      <BackBtn onClick={reset} label={hi ? 'नई जांच' : 'New check'} />
      <h2 className={styles.heading}>{hi ? 'आपके लक्षणों का विश्लेषण' : 'Symptom Analysis'}</h2>

      {loading && (
        <div className={styles.loadingBox}>
          <span className={styles.spinner} />
          <p>{hi ? 'AI जांच कर रहा है...' : 'AI is analysing...'}</p>
        </div>
      )}

      {error && <p className={styles.errorText}>{error}</p>}

      {!loading && result && (
        <div className={styles.resultWrap}>

          {/* Possible conditions */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>{hi ? 'हो सकता है' : 'Possible conditions'}</p>
            <div className={styles.conditionList}>
              {result.conditions?.map((c, i) => (
                <span key={i} className={`${styles.conditionBadge} ${i === 0 ? styles.conditionFirst : ''}`}>{c}</span>
              ))}
            </div>
          </div>

          {/* Verdict */}
          <div className={styles.verdictCard} style={{ borderColor: verdictColor[result.verdict] }}>
            <p className={styles.verdictText} style={{ color: verdictColor[result.verdict] }}>
              {verdictLabel[result.verdict] || result.verdict}
            </p>
            <p className={styles.verdictReason}>{result.doctor_reason}</p>
          </div>

          {/* Home care steps */}
          {result.verdict === 'HOME_CARE' && result.home_care?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>{hi ? 'घर पर क्या करें' : 'What to do at home'}</p>
              <ol className={styles.careList}>
                {result.home_care.map((s, i) => (
                  <li key={i} className={styles.careItem}>{s}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Warning signs */}
          {result.warning_signs?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>{hi ? '⚠️ इन लक्षणों पर तुरंत डॉक्टर जाएं' : '⚠️ Go to doctor immediately if'}</p>
              <ul className={styles.warnList}>
                {result.warning_signs.map((s, i) => (
                  <li key={i} className={styles.warnItem}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BackBtn({ onClick, label }) {
  return (
    <button className={styles.backBtn} onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {label || 'Back'}
    </button>
  )
}
