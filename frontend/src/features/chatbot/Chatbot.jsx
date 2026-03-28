import { useEffect, useRef, useState } from "react";
import { chatWithEarth, sendChatMessage } from "../../services/api";
import { analyseMedicineLabelFromImage } from "../../services/featherless";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import styles from "./Chatbot.module.css";

// ── Session helpers (localStorage) ──────────────────────────
function getSessionsKey(userId) {
  return `earth_chats_${userId}`;
}
function loadSessions(userId) {
  try { return JSON.parse(localStorage.getItem(getSessionsKey(userId)) || "[]"); }
  catch { return []; }
}
function persistSessions(userId, sessions) {
  localStorage.setItem(getSessionsKey(userId), JSON.stringify(sessions));
}
function makeSessionTitle(text) {
  return text.length > 42 ? text.slice(0, 42) + "…" : text;
}
function formatSessionTime(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function MedicineBubble({ data }) {
  return (
    <div className={styles.medicineBubble}>
      <div className={styles.medicineChips}>
        <div className={styles.chip}>
          <span className={styles.chipLabel}>Expiry</span>
          <span className={styles.chipValue}>{data.expiry || "—"}</span>
        </div>
        <div className={styles.chip}>
          <span className={styles.chipLabel}>Used For</span>
          <span className={styles.chipValue}>{data.purpose || "—"}</span>
        </div>
        <div className={styles.chip}>
          <span className={styles.chipLabel}>Price / MRP</span>
          <span className={styles.chipValue}>{data.price || "—"}</span>
        </div>
      </div>
      <div className={styles.medicineExplanation}>{data.explanation}</div>
    </div>
  );
}

export default function Chatbot({ ocrFile, onOcrFileClear, user, onSignInClick }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const bottomRef = useRef(null);
  const processedRef = useRef(false);
  const currentSessionIdRef = useRef(null);

  // keep ref in sync for use inside closures
  useEffect(() => { currentSessionIdRef.current = currentSessionId; }, [currentSessionId]);

  // Load sessions from localStorage when user signs in
  useEffect(() => {
    if (user) {
      const saved = loadSessions(user.id || user._id);
      setSessions(saved);
    } else {
      setSessions([]);
      setCurrentSessionId(null);
    }
  }, [user]);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  // ── Save / update session in localStorage ───────────────
  function upsertSession(userId, sessionId, msgs, title) {
    setSessions(prev => {
      const existing = prev.find(s => s.id === sessionId);
      let next;
      if (existing) {
        next = prev.map(s => s.id === sessionId ? { ...s, messages: msgs, updatedAt: new Date().toISOString() } : s);
      } else {
        const newSession = { id: sessionId, title, messages: msgs, updatedAt: new Date().toISOString() };
        next = [newSession, ...prev];
      }
      persistSessions(userId, next);
      return next;
    });
  }

  // ── Load a past session ──────────────────────────────────
  function loadSession(session) {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setError("");
  }

  // ── Start new chat ───────────────────────────────────────
  function handleNewChat() {
    setMessages([]);
    setCurrentSessionId(null);
    setError("");
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  // ── OCR → Featherless ────────────────────────────────────
  useEffect(() => {
    if (!ocrFile || processedRef.current) return;
    processedRef.current = true;

    const run = async () => {
      setMessages([{ role: "user", content: "📷 Medicine label image uploaded — reading with AI vision..." }]);
      setLoading(true);
      onOcrFileClear?.();

      try {
        const data = await analyseMedicineLabelFromImage(ocrFile);
        setMessages((prev) => [...prev, { role: "assistant", type: "medicine", data }]);

        if (data.explanation) {
          const lang = localStorage.getItem("earth_language") || "en";
          const isHindi = lang === "hi";
          const speakText = isHindi
            ? `${data.purpose ? "यह दवाई " + data.purpose + " के लिए है। " : ""}${data.expiry ? "इसकी एक्सपायरी " + data.expiry + " है। " : ""}${data.explanation}`
            : `${data.purpose ? "This medicine is used for " + data.purpose + ". " : ""}${data.expiry ? "Expiry: " + data.expiry + ". " : ""}${data.explanation}`;
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(speakText);
          utt.lang = isHindi ? "hi-IN" : "en-IN";
          utt.rate = 0.88;
          setSpeaking(true);
          utt.onend = () => setSpeaking(false);
          utt.onerror = () => setSpeaking(false);
          window.speechSynthesis.speak(utt);
        }
      } catch (err) {
        setMessages((prev) => [...prev, { role: "assistant", content: err.message || "Something went wrong reading the label." }]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [ocrFile]);

  // ── Regular chat ─────────────────────────────────────────
  const handleSend = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    const updatedMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(updatedMessages);
    setInput("");
    setError("");
    setLoading(true);

    // Create session on first message if signed in
    const userId = user?.id || user?._id;
    let sessionId = currentSessionIdRef.current;
    let sessionTitle = null;

    if (user && !sessionId) {
      sessionId = `sess_${Date.now()}`;
      sessionTitle = makeSessionTitle(trimmed);
      setCurrentSessionId(sessionId);
    }

    try {
      let reply;
      if (user) {
        const history = messages.map(m => ({ role: m.role, content: m.content || "" }));
        const data = await sendChatMessage(trimmed, history);
        reply = data.reply;
      } else {
        const data = await chatWithEarth(trimmed);
        reply = data.reply;
      }

      const finalMessages = [...updatedMessages, { role: "assistant", content: reply }];
      setMessages(finalMessages);

      // Save to localStorage
      if (user && sessionId) {
        upsertSession(userId, sessionId, finalMessages, sessionTitle || makeSessionTitle(trimmed));
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleStopSpeak = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <div className={styles.page}>
      {toast && (
        <div style={{
          position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
          background: "#333", color: "#fff", padding: "8px 18px", borderRadius: 8,
          fontSize: 13, zIndex: 1100,
        }}>
          Voice not supported on this browser
        </div>
      )}

      {speaking && (
        <div className={styles.speakingBadge} onClick={handleStopSpeak}>
          <span className={styles.speakDot} />
          Speaking... (tap to stop)
        </div>
      )}

      {/* LEFT PANEL */}
      <aside className={styles.leftPanel}>
        <div className={`${styles.leftContent} ${user ? styles.leftContentUnlocked : ""}`}>
          {user ? (
            <>
              <button className={styles.newChatBtn} onClick={handleNewChat}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Chat
              </button>

              <p className={styles.pastChatsHeading}>Past Chats</p>

              {sessions.length === 0 ? (
                <p className={styles.noSessions}>No past chats yet. Start a conversation!</p>
              ) : (
                <ul className={styles.pastChatList}>
                  {sessions.map((s) => (
                    <li
                      key={s.id}
                      className={`${styles.pastChatItem} ${s.id === currentSessionId ? styles.pastChatItemActive : ""}`}
                      onClick={() => loadSession(s)}
                    >
                      <span className={styles.sessionTitle}>{s.title}</span>
                      <span className={styles.sessionTime}>{formatSessionTime(s.updatedAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <p className={styles.pastChatsHeading}>Past Chats</p>
              <ul className={styles.pastChatList}>
                {["Medicine label query", "Crop disease help", "Government schemes", "Career guidance", "Women's safety laws"].map((label) => (
                  <li key={label} className={styles.pastChatItem}>{label}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {!user && (
          <div className={styles.lockedOverlay}>
            <svg className={styles.lockIcon} viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <p className={styles.lockText}>Sign in to view history</p>
            <button className={styles.signInBtn} onClick={onSignInClick}>Sign In</button>
          </div>
        )}

        {user && (
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user.name}</p>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
        )}
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

          {messages.map((msg, i) => {
            if (msg.type === "medicine") {
              return (
                <div key={i} className={`${styles.bubble} ${styles.aiBubble} ${styles.medicineBubbleWrap}`}>
                  <MedicineBubble data={msg.data} />
                </div>
              );
            }
            return (
              <div
                key={i}
                className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.aiBubble}`}
              >
                {msg.content}
              </div>
            );
          })}

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
