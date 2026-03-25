import { useMemo, useState } from "react";
import VoiceRecorder from "../../components/earth/VoiceRecorder";
import ImageUploader from "../../components/earth/ImageUploader";
import AIResponseCard from "../../components/earth/AIResponseCard";
import AudioPlayer from "../../components/earth/AudioPlayer";
import { useAI } from "../../hooks/useAI";
import { useOCR } from "../../hooks/useOCR";
import { symptomChecker, textToSpeech } from "../../services/api";
import styles from "./SymptomChecker.module.css";

export default function SymptomChecker() {
  const [symptomsText, setSymptomsText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [ttsError, setTtsError] = useState("");

  const { runOCR, loading: ocrLoading, error: ocrError } = useOCR();
  const { execute, data, loading: aiLoading, error: aiError } = useAI(symptomChecker);

  const responseSummary = useMemo(() => {
    if (!data) return "";
    return [
      `Possible condition: ${data.condition}`,
      `Severity: ${data.severity}`,
      data.advice,
      data.needsDoctor ? "Doctor consultation recommended." : "Home care may be enough for now.",
    ].join(" ");
  }, [data]);

  const handleVoiceTranscript = (text) => {
    setSymptomsText((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleCheck = async () => {
    if (!symptomsText.trim()) return;

    setTtsError("");
    setAudioUrl("");

    let imageDescription = "";
    if (imageFile) {
      imageDescription = await runOCR(imageFile);
    }

    const result = await execute({
      symptomsText: symptomsText.trim(),
      imageDescription: imageDescription || undefined,
    });

    if (!result) return;

    try {
      const tts = await textToSpeech(responseSummary || result.advice);
      if (tts?.audioUrl) {
        setAudioUrl(tts.audioUrl);
      }
    } catch (err) {
      setTtsError(err instanceof Error ? err.message : "Audio output failed");
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Symptom Checker</h2>
      <p className={styles.subtitle}>Speak or type symptoms for guided triage</p>

      <VoiceRecorder onTranscript={handleVoiceTranscript} />

      <textarea
        className={styles.input}
        value={symptomsText}
        onChange={(event) => setSymptomsText(event.target.value)}
        placeholder="Example: Fever and dry cough for 2 days"
      />

      <ImageUploader onFileSelected={setImageFile} />

      <button
        className={styles.primaryButton}
        onClick={handleCheck}
        disabled={!symptomsText.trim() || aiLoading || ocrLoading}
      >
        {aiLoading || ocrLoading ? "AI is analyzing..." : "Check Symptoms"}
      </button>

      {(ocrError || aiError || ttsError) && (
        <div className={styles.errorBox}>
          <p>{ocrError || aiError || ttsError}</p>
          <button onClick={handleCheck}>Retry</button>
        </div>
      )}

      <AIResponseCard
        title={data?.condition || "Result"}
        content={responseSummary}
        warning={data?.needsDoctor ? "Please consult a doctor soon." : ""}
        loading={aiLoading || ocrLoading}
      />

      <AudioPlayer audioUrl={audioUrl} autoPlay />

      {data?.followUpQuestions?.length > 0 && (
        <div className={styles.followups}>
          <h4>Follow-up questions</h4>
          {data.followUpQuestions.map((question, index) => (
            <p key={`${question}-${index}`}>• {question}</p>
          ))}
        </div>
      )}
    </div>
  );
}
