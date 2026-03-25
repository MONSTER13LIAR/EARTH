import { useMemo, useState } from "react";
import VoiceRecorder from "../../components/earth/VoiceRecorder";
import AIResponseCard from "../../components/earth/AIResponseCard";
import AudioPlayer from "../../components/earth/AudioPlayer";
import { useAI } from "../../hooks/useAI";
import { doctorOrHomeDecision, symptomChecker, textToSpeech } from "../../services/api";
import styles from "./DoctorDecision.module.css";

export default function DoctorDecision() {
  const [symptoms, setSymptoms] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");

  const symptomAI = useAI(symptomChecker);
  const decisionAI = useAI(doctorOrHomeDecision);

  const decisionText = useMemo(() => {
    const data = decisionAI.data;
    if (!data) return "";
    const steps = (data.remedySteps || []).map((step, index) => `${index + 1}. ${step}`).join(" ");
    return `${data.decision}. Reason: ${data.reason}. ${steps}`;
  }, [decisionAI.data]);

  const handleVoiceTranscript = (text) => {
    setSymptoms((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleDecision = async () => {
    if (!symptoms.trim()) return;

    setError("");
    setAudioUrl("");

    const symptomData = await symptomAI.execute({
      symptomsText: symptoms.trim(),
    });

    if (!symptomData) return;

    const decision = await decisionAI.execute({
      symptomData,
    });

    if (!decision) return;

    try {
      const tts = await textToSpeech(decisionText || decision.reason);
      if (tts?.audioUrl) {
        setAudioUrl(tts.audioUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice output failed");
    }
  };

  const loading = symptomAI.loading || decisionAI.loading;
  const apiError = error || symptomAI.error || decisionAI.error;

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Doctor or Home Decision</h2>
      <p className={styles.subtitle}>Get clear triage guidance and action steps</p>

      <VoiceRecorder onTranscript={handleVoiceTranscript} />

      <textarea
        className={styles.input}
        value={symptoms}
        onChange={(event) => setSymptoms(event.target.value)}
        placeholder="Describe your symptoms"
      />

      <button className={styles.primaryButton} onClick={handleDecision} disabled={!symptoms.trim() || loading}>
        {loading ? "AI is deciding..." : "Get Decision"}
      </button>

      {apiError && (
        <div className={styles.errorBox}>
          <p>{apiError}</p>
          <button onClick={handleDecision}>Retry</button>
        </div>
      )}

      <AIResponseCard
        title={decisionAI.data?.decision || "Decision"}
        content={decisionText}
        warning={decisionAI.data?.decision === "Go to doctor" ? "Do not delay medical consultation." : ""}
        loading={loading}
      />

      <AudioPlayer audioUrl={audioUrl} autoPlay />
    </div>
  );
}
