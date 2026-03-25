import { useState } from 'react'
import { getCurrentUser } from '../services/api'
import styles from './Tools.module.css'
import MedicineLabelReader from '../features/medicine-reader/MedicineLabelReader'
import SymptomChecker from '../features/symptom-checker/SymptomChecker'
import DoctorDecision from '../features/doctor-decision/DoctorDecision'
import DoctorVisitExplainer from '../features/doctor-visit-explainer/DoctorVisitExplainer'

export default function Tools() {
  const [activeTool, setActiveTool] = useState('list')
  const user = getCurrentUser()

  const toolsData = [
    { id: 'medicine', name: 'Medicine Reader', description: 'Read labels, dosage, and safety warnings', color: '#E53935' },
    { id: 'symptom', name: 'Symptom Checker', description: 'Analyze symptoms from voice/text and image', color: '#1E88E5' },
    { id: 'doctor-decision', name: 'Doctor or Home', description: 'Get triage decision with care steps', color: '#43A047' },
    { id: 'visit-explainer', name: 'Visit Explainer', description: 'Reconstruct and explain doctor instructions', color: '#FB8C00' },
  ]

  const renderTool = () => {
    if (activeTool === 'medicine') return <MedicineLabelReader />
    if (activeTool === 'symptom') return <SymptomChecker />
    if (activeTool === 'doctor-decision') return <DoctorDecision />
    if (activeTool === 'visit-explainer') return <DoctorVisitExplainer />
    return null
  }

  if (!user) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.lockedCard}>
          <h2>Login Required</h2>
          <p>Please login or create an account from the navbar to use AI tools.</p>
        </div>
      </div>
    )
  }

  if (activeTool !== 'list') {
    return (
      <div>
        <button className={styles.backButton} onClick={() => setActiveTool('list')}>
          ← Back to tools
        </button>
        {renderTool()}
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardContainer}>
        {toolsData.map((tool) => (
          <button
            key={tool.id}
            className={styles.card}
            style={{ backgroundColor: tool.color }}
            onClick={() => setActiveTool(tool.id)}
          >
            <h2 className={styles.cardName}>{tool.name}</h2>
            <p className={styles.cardDesc}>{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
