import { useEffect, useRef, useState } from "react";
import styles from "./AudioPlayer.module.css";

export default function AudioPlayer({ audioUrl, autoPlay = true }) {
  const audioRef = useRef(null);
  const [playError, setPlayError] = useState("");

  const playNow = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setPlayError("");
    } catch {
      setPlayError("Playback did not start. Please tap Play again.");
    }
  };

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const audio = audioRef.current;
    audio.load();
    setPlayError("");

    if (!autoPlay) return;
    void playNow();
  }, [audioUrl, autoPlay]);

  if (!audioUrl) return null;

  return (
    <div className={styles.wrapper}>
      <button className={styles.playButton} onClick={playNow}>
        ▶ Tap to Play Audio
      </button>
      <audio ref={audioRef} controls src={audioUrl} className={styles.audio} />
      {playError ? <p className={styles.error}>{playError}</p> : null}
    </div>
  );
}
