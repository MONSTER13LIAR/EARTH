import { useMemo, useState } from "react";
import VoiceRecorder from "../../components/earth/VoiceRecorder";
import AIResponseCard from "../../components/earth/AIResponseCard";
import AudioPlayer from "../../components/earth/AudioPlayer";
import { useAI } from "../../hooks/useAI";
import { doctorVisitExplainer, textToSpeech } from "../../services/api";
import styles from "./DoctorVisitExplainer.module.css";

export default function DoctorVisitExplainer() {
  const [memoryText, setMemoryText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [ttsError, setTtsError] = useState("");

  const { execute, loading, data, error } = useAI(doctorVisitExplainer);

  const summary = useMemo(() => {
    if (!data) return "";
    const meds = (data.medicines || []).join(", ");
    const precautions = (data.precautions || []).join(", ");
    return `${data.simpleExplanation} Medicines: ${meds}. Precautions: ${precautions}.`;
  }, [data]);

  const handleVoiceTranscript = (text) => {
    setMemoryText((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleExplain = async () => {
    if (!memoryText.trim()) return;

    setTtsError("");
    setAudioUrl("");

    const result = await execute({
      partialVoiceMemory: memoryText.trim(),
    });

    if (!result) return;

    try {
      const tts = await textToSpeech(summary || result.simpleExplanation);
      if (tts?.audioUrl) {
        setAudioUrl(tts.audioUrl);
      }
    } catch (err) {
      setTtsError(err instanceof Error ? err.message : "Voice output failed");
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Doctor Visit Explainer</h2>
      <p className={styles.subtitle}>Share partial memory and get a complete explanation</p>

      <VoiceRecorder onTranscript={handleVoiceTranscript} />

      <textarea
        className={styles.input}
        value={memoryText}
        onChange={(event) => setMemoryText(event.target.value)}
        placeholder="Example: Doctor said mild infection and gave 2 medicines"
      />

      <button className={styles.primaryButton} onClick={handleExplain} disabled={!memoryText.trim() || loading}>
        {loading ? "AI is preparing explanation..." : "Explain Clearly"}
      </button>

      {(error || ttsError) && (
        <div className={styles.errorBox}>
          <p>{error || ttsError}</p>
          <button onClick={handleExplain}>Retry</button>
        </div>
      )}

      <AIResponseCard title={data?.diagnosis || "Diagnosis"} content={summary} warning="" loading={loading} />

      <AudioPlayer audioUrl={audioUrl} autoPlay />

      {data && (
        <div className={styles.details}>
          <p><strong>Diagnosis:</strong> {data.diagnosis}</p>
          <p><strong>Medicines:</strong> {(data.medicines || []).join(", ") || "-"}</p>
          <p><strong>Precautions:</strong> {(data.precautions || []).join(", ") || "-"}</p>
        </div>
      )}
    </div>
  );
}
