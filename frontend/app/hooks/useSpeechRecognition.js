import { useState, useRef, useCallback } from "react";

/**
 * Shared speech-recognition hook. Used by both Pronunciation.jsx and
 * SpeechListener.jsx so recognition logic exists in exactly one place.
 *
 * Guards against calling .start() while a recognition session is already
 * active, which is what caused the "didn't catch that" InvalidStateError
 * when a component's effects or handlers fired more than once.
 */
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const activeRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const listen = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        const msg = "Speech recognition is not supported in this browser.";
        setError(msg);
        reject(new Error(msg));
        return;
      }

      if (activeRef.current) {
        // Already listening -- ignore the extra call instead of throwing.
        return;
      }

      const SpeechRecognitionImpl =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionImpl();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognitionRef.current = recognition;

      setError("");
      setIsListening(true);
      activeRef.current = true;

      recognition.onresult = (event) => {
        const spokenText = event.results[event.results.length - 1][0].transcript.trim();
        setTranscript(spokenText);
        setIsListening(false);
        activeRef.current = false;
        resolve(spokenText);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        activeRef.current = false;
        const msg =
          event.error === "no-speech"
            ? "Didn't catch that -- try again."
            : `Recognition error: ${event.error}`;
        setError(msg);
        reject(new Error(msg));
      };

      recognition.onend = () => {
        setIsListening(false);
        activeRef.current = false;
      };

      recognition.start();
    });
  }, [isSupported]);

  const reset = useCallback(() => {
    setTranscript("");
    setError("");
  }, []);

  return { isListening, transcript, error, isSupported, listen, reset };
}