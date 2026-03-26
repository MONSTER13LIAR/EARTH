import { useState } from "react";

export function useSpeechRecognition({ onResult }) {
  const [isListening, setIsListening] = useState(false);

  const supported =
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const startListening = () => {
    if (!supported) return false;

    const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SR();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      onResult(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    return true;
  };

  return { isListening, startListening, supported };
}
