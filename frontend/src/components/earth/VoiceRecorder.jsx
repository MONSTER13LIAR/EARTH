import { useVoiceInput } from "../../hooks/useVoiceInput";
import styles from "./VoiceRecorder.module.css";

export default function VoiceRecorder({ onTranscript }) {
  const { isRecording, transcript, isProcessing, error, startRecording, stopAndTranscribe, retry } = useVoiceInput();

  const handleToggle = async () => {
    if (!isRecording) {
      await startRecording();
      return;
    }

    const text = await stopAndTranscribe();
    if (text && onTranscript) {
      onTranscript(text);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.micButton} onClick={handleToggle} disabled={isProcessing}>
        {isRecording ? "Stop Recording" : "Use Microphone"}
      </button>

      {isProcessing && <p className={styles.meta}>Processing voice...</p>}
      {transcript && <p className={styles.transcript}>"{transcript}"</p>}

      {error && (
        <div className={styles.errorBox}>
          <span>{error}</span>
          <button onClick={retry}>Retry</button>
        </div>
      )}
    </div>
  );
}
