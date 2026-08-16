import React, { useState, useRef } from "react";
import axios from "axios";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import {API_BASE } from "../context/AuthContext";
const RECORDING_MS = 5000;

const SpeechListener = () => {
  const { isListening, transcript, error: recognitionError, listen } = useSpeechRecognition();

  const [isRecording, setIsRecording] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const countdownRef = useRef(null);

  const startRecording = async () => {
    setFeedback("");
    setAudioBlob(null);

    listen().catch(() => {});

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
      mediaRecorder.onstop = () => {
        setAudioBlob(new Blob(chunks, { type: mimeType }));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSecondsLeft(RECORDING_MS / 1000);

      countdownRef.current = setInterval(() => {
        setRecordSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
        clearInterval(countdownRef.current);
      }, RECORDING_MS);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setFeedback("Could not access microphone. Check browser permissions.");
      setIsRecording(false);
    }
  };

  const sendAudioForPrediction = async () => {
    if (!audioBlob) {
      setFeedback("Record some audio first.");
      return;
    }

    const extension = audioBlob.type.includes("webm") ? "webm" : "ogg";
    const formData = new FormData();
    formData.append("file", audioBlob, `speech.${extension}`);

    setAnalyzing(true);
    try {
      const response = await axios.post(`${API_BASE}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { speech_impediment_detected } = response.data;
      setFeedback(speech_impediment_detected ? "Speech issues detected" : "Speech is clear");
    } catch (err) {
      console.error("Error sending audio for prediction:", err);
      const serverMessage = err.response?.data?.error;
      setFeedback(serverMessage || "Error analyzing speech. Is the backend running?");
    } finally {
      setAnalyzing(false);
    }
  };

  const busy = isRecording || isListening;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-custom2">SpeechEase</h1>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
        <button
          onClick={startRecording}
          disabled={busy}
          className={`transition duration-300 ease-in-out transform hover:scale-105 ${
            busy ? "bg-gray-400 cursor-not-allowed" : "bg-customBrown hover:bg-customBrown2"
          } text-white font-bold py-3 px-6 rounded`}
        >
          {isRecording ? `Recording... (${recordSecondsLeft}s)` : "Start Recording"}
        </button>

        <button
          onClick={sendAudioForPrediction}
          disabled={!audioBlob || analyzing}
          className="transition duration-300 ease-in-out transform hover:scale-105 bg-custom hover:bg-customBrown text-white font-bold py-3 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? "Analyzing..." : "Send for Analysis"}
        </button>
      </div>

      <div className="mt-6 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">Transcript:</h2>
        <div
          className="p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-md overflow-y-auto"
          style={{ height: "150px" }}
        >
          {transcript || <span className="text-gray-400">No speech detected yet...</span>}
        </div>
        {recognitionError && (
          <p className="mt-2 text-sm text-red-600">{recognitionError}</p>
        )}
      </div>

      <div className="mt-6 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">Feedback:</h2>
        <div
          className={`p-4 rounded-lg shadow-md border border-gray-300 text-center ${
            feedback.includes("issues") ? "bg-red-200 text-red-800" : "bg-customBrown4 text-green-800"
          }`}
          style={{ height: "100px" }}
        >
          {feedback || <span className="text-gray-400">Awaiting feedback...</span>}
        </div>
      </div>
    </div>
  );
};

export default SpeechListener;