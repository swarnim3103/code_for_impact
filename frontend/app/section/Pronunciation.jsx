import React, { useState } from "react";
import axios from "axios";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useAuth, API_BASE } from "../context/AuthContext";

const Pronunciation = () => {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [addedToLibrary, setAddedToLibrary] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const { isListening, listen, error: recognitionError } = useSpeechRecognition();
  const { isAuthenticated, authHeader } = useAuth();

  const handleInputChange = (e) => {
    setWord(e.target.value);
    setResult(null);
    setAddedToLibrary(false);
  };

  const pronounceWord = () => {
    if (word) {
      const utterance = new SpeechSynthesisUtterance(word);
      speechSynthesis.speak(utterance);
    }
  };

  const practiceWord = async () => {
    if (!word.trim()) return;
    setError("");
    setResult(null);
    setAddedToLibrary(false);

    let spokenWord;
    try {
      spokenWord = await listen();
    } catch (err) {
      setError(err.message);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/analyze-pronunciation`,
        { target_word: word.trim(), transcribed_word: spokenWord },
        { headers: authHeader() }
      );
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Could not analyze pronunciation. Is the backend running?");
    }
  };

  const addToLibrary = async () => {
    if (!word.trim()) return;
    if (!isAuthenticated) {
      setError("Log in to save words to your library.");
      return;
    }
    try {
      const category = result && !result.correct ? "Special Care" : "Overcome";
      await axios.post(
        `${API_BASE}/library`,
        { word: word.trim(), category },
        { headers: authHeader() }
      );
      setAddedToLibrary(true);
    } catch (err) {
      console.error(err);
      setError("Could not save to library.");
    }
  };

  const busy = isListening || analyzing;

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full flex flex-col items-center justify-center mt-20 mb-10 mx-auto">
      <h1 className="text-3xl font-bold mb-4">Word Pronunciation</h1>
      <input
        type="text"
        value={word}
        onChange={handleInputChange}
        placeholder="Enter a word"
        className="p-2 border border-gray-300 rounded mb-4 w-full"
      />
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={pronounceWord}
          disabled={!word.trim()}
          className="bg-customBrown hover:bg-customBrown2 text-white p-2 rounded disabled:opacity-50"
        >
          Hear it
        </button>
        <button
          onClick={practiceWord}
          disabled={busy || !word.trim()}
          className={`text-white p-2 rounded ${
            busy ? "bg-gray-400 cursor-not-allowed" : "bg-customBrown hover:bg-customBrown2"
          }`}
        >
          {isListening ? "Listening..." : "Practice Saying It"}
        </button>
        <button
          onClick={addToLibrary}
          disabled={!word.trim() || addedToLibrary}
          className="bg-customBrown hover:bg-customBrown2 text-white p-2 rounded disabled:opacity-50"
        >
          {addedToLibrary ? "Added" : "Add to Library"}
        </button>
      </div>

      {!isAuthenticated && (
        <p className="mt-3 text-xs text-gray-500">
          Log in to save practice history and library words.
        </p>
      )}

      {(error || recognitionError) && (
        <p className="mt-4 text-red-600 text-sm">{error || recognitionError}</p>
      )}

      {result && !result.error && (
        <div
          className={`mt-6 w-full p-4 rounded-lg text-center ${
            result.correct ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-900"
          }`}
        >
          <p className="font-semibold mb-1">You said: "{result.transcribed_word}"</p>
          <p>{result.feedback}</p>
        </div>
      )}

      {result && result.error && <p className="mt-4 text-gray-600 text-sm">{result.error}</p>}
    </div>
  );
};

export default Pronunciation;