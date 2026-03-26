import { useEffect, useRef, useState } from "react";
import { chatWithEarth } from "../../services/api";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import styles from "./Chatbot.module.css";

const PAST_CHATS = [
  "Medicine label query",
  "Crop disease help",
  "Government schemes",
  "Career guidance",
  "Women's safety laws",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const bottomRef = useRef(null);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleSend = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const data = await chatWithEarth(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pick up message sent from the global sticky bar
  useEffect(() => {
    const pending = localStorage.getItem("pendingMessage");
    if (pending) {
      localStorage.removeItem("pendingMessage");
      handleSend(pending);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const { isListening, startListening, supported } = useSpeechRecognition({
    onResult: (transcript) => {
      setInput(transcript);
      handleSend(transcript);
    },
  });

  const handleMic = () => {
    if (!supported) { showToast(); return; }
    startListening();
  };

  return (
    <div className={styles.page}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: '#333', color: '#fff', padding: '8px 18px', borderRadius: 8,
          fontSize: 13, zIndex: 1100,
        }}>
          Voice not supported on this browser
        </div>
      )}

      {/* LEFT PANEL */}
      <aside className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <p className={styles.pastChatsHeading}>Past Chats</p>
          <ul className={styles.pastChatList}>
            {PAST_CHATS.map((label) => (
              <li key={label} className={styles.pastChatItem}>{label}</li>
            ))}
          </ul>
        </div>
        <div className={styles.lockedOverlay}>
          <svg className={styles.lockIcon} viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
          </svg>
          <p className={styles.lockText}>Sign in to view history</p>
          <button className={styles.signInBtn}>Sign In</button>
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className={styles.rightPanel}>
        <div className={styles.messageList}>
          {messages.length === 0 && !loading && (
            <div className={styles.welcome}>
              <p className={styles.welcomeTitle}>Namaste! I am EARTH Assistant.</p>
              <p className={styles.welcomeSub}>Ask me anything about health, farming, education, or women's safety.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.aiBubble}`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className={`${styles.bubble} ${styles.aiBubble} ${styles.typing}`}>
              <span /><span /><span />
            </div>
          )}

          {error && (
            <div className={`${styles.bubble} ${styles.aiBubble} ${styles.errorBubble}`}>
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT BAR */}
        <div className={styles.inputWrapper}>
          <div className={styles.inputBar}>
            <button
              className={`${styles.micBtn} ${isListening ? styles.micActive : ""}`}
              onClick={handleMic}
              title={isListening ? "Listening..." : "Record voice"}
            >
              <svg viewBox="0 0 24 24" className={styles.micIcon}>
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
            <input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Ask EARTH anything..."}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              <svg viewBox="0 0 24 24" className={styles.sendIcon}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
