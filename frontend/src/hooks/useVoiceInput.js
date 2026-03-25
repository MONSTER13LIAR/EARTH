import { useCallback, useRef, useState } from "react";
import { speechToText } from "../services/api";

export function useVoiceInput() {
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const startRecording = useCallback(async () => {
    setError("");

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError("Aapke device mein mic recording support nahi hai.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data?.size > 0) chunksRef.current.push(event.data);
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  const stopAndTranscribe = useCallback(async () => {
    setIsProcessing(true);
    setError("");

    try {
      const audioBlob = await stopRecording();
      if (!audioBlob) {
        throw new Error("Recording start nahi hui thi.");
      }

      const data = await speechToText(audioBlob);
      setTranscript(data.transcript || "");
      return data.transcript || "";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Voice process fail hua";
      setError(message);
      return "";
    } finally {
      setIsProcessing(false);
    }
  }, [stopRecording]);

  const retry = useCallback(() => {
    setError("");
    setTranscript("");
  }, []);

  return {
    isRecording,
    transcript,
    isProcessing,
    error,
    startRecording,
    stopAndTranscribe,
    retry,
    setTranscript,
  };
}
