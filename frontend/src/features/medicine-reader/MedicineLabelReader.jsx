import { useMemo, useState } from "react";
import VoiceRecorder from "../../components/earth/VoiceRecorder";
import ImageUploader from "../../components/earth/ImageUploader";
import AIResponseCard from "../../components/earth/AIResponseCard";
import AudioPlayer from "../../components/earth/AudioPlayer";
import { useOCR } from "../../hooks/useOCR";
import { useAI } from "../../hooks/useAI";
import { medicineLabelReader, textToSpeech } from "../../services/api";
import styles from "./MedicineLabelReader.module.css";

export default function MedicineLabelReader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [voiceText, setVoiceText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [ttsError, setTtsError] = useState("");

  const { ocrText, loading: ocrLoading, error: ocrError, runOCR } = useOCR();
  const { loading: aiLoading, error: aiError, data, execute } = useAI(medicineLabelReader);

  const summaryText = useMemo(() => {
    if (!data) return "";
    return [data.simpleSummary, data.overdoseWarning].filter(Boolean).join(" ");
  }, [data]);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setTtsError("");
    const extractedText = await runOCR(selectedFile);
    if (!extractedText) return;

    const aiResult = await execute({
      ocrText: [extractedText, voiceText].filter(Boolean).join(" "),
      intakeWindowHours: 6,
    });

    if (!aiResult) return;

    try {
      const tts = await textToSpeech([aiResult.simpleSummary, aiResult.overdoseWarning].filter(Boolean).join(" "));
      if (tts?.audioUrl) {
        setAudioUrl(tts.audioUrl);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Audio playback failed";
      setTtsError(message);
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Medicine Label Reader</h2>
      <p className={styles.subtitle}>Upload a label, get instant explanation and audio</p>

      <ImageUploader onFileSelected={setSelectedFile} />

      <VoiceRecorder onTranscript={setVoiceText} />

      <button
        className={styles.primaryButton}
        onClick={handleAnalyze}
        disabled={!selectedFile || ocrLoading || aiLoading}
      >
        {ocrLoading || aiLoading ? "Processing..." : "Analyze Medicine"}
      </button>

      {(ocrError || aiError || ttsError) && (
        <div className={styles.errorBox}>
          <p>{ocrError || aiError || ttsError}</p>
          <button onClick={handleAnalyze}>Retry</button>
        </div>
      )}

      <AIResponseCard
        title={data?.medicineName || "Medicine Result"}
        content={summaryText || ocrText}
        warning={data?.duplicatePrevented ? "Recent intake detected. Avoid duplicate dose." : data?.overdoseWarning}
        loading={ocrLoading || aiLoading}
      />

      <AudioPlayer audioUrl={audioUrl} autoPlay />

      {data && (
        <div className={styles.details}>
          <p><strong>Dosage:</strong> {data.dosage}</p>
          <p><strong>Expiry:</strong> {data.expiry}</p>
          <p><strong>Duplicate Prevention:</strong> {data.duplicatePrevented ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}
