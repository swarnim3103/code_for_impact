// src/Pronunciation.js
import React, { useState } from 'react';
import axios from 'axios';

const Pronunciation = () => {
  const [word, setWord] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [addedToLibrary, setAddedToLibrary] = useState(false);

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

  const practiceWord = () => {
    if (!word.trim()) return;
    setError('');
    setResult(null);
    setAddedToLibrary(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = async (event) => {
      const spokenWord = event.results[0][0].transcript.trim();
      setIsListening(false);

      try {
        const response = await axios.post('http://localhost:5000/analyze-pronunciation', {
          target_word: word.trim(),
          transcribed_word: spokenWord,
        });
        setResult(response.data);
      } catch (err) {
        console.error(err);
        setError('Could not analyze pronunciation. Is the backend running?');
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setIsListening(false);
      setError('Didn\'t catch that — try again.');
    };

    recognition.start();
  };

  const addToLibrary = async () => {
    if (!word.trim()) return;
    try {
      // "Special Care" for words the user just struggled with, otherwise a general bucket.
      const category = result && !result.correct ? 'Special Care' : 'Overcome';
      await axios.post('http://localhost:5000/library', { word: word.trim(), category });
      setAddedToLibrary(true);
    } catch (err) {
      console.error(err);
      setError('Could not save to library.');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full flex flex-col items-center justify-center mt-20 mb-10 ml-40">
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
          className="bg-customBrown hover:bg-customBrown2 text-white p-2 rounded"
        >
          Hear it
        </button>
        <button
          onClick={practiceWord}
          disabled={isListening || !word.trim()}
          className={`text-white p-2 rounded ${isListening ? 'bg-gray-400 cursor-not-allowed' : 'bg-customBrown hover:bg-customBrown2'}`}
        >
          {isListening ? 'Listening...' : 'Practice Saying It'}
        </button>
        <button
          onClick={addToLibrary}
          disabled={!word.trim() || addedToLibrary}
          className="bg-customBrown hover:bg-customBrown2 text-white p-2 rounded disabled:opacity-50"
        >
          {addedToLibrary ? 'Added ✓' : 'Add to Library'}
        </button>
      </div>

      {error && (
        <p className="mt-4 text-red-600 text-sm">{error}</p>
      )}

      {result && !result.error && (
        <div className={`mt-6 w-full p-4 rounded-lg text-center ${result.correct ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-900'}`}>
          <p className="font-semibold mb-1">
            You said: "{result.transcribed_word}"
          </p>
          <p>{result.feedback}</p>
        </div>
      )}

      {result && result.error && (
        <p className="mt-4 text-gray-600 text-sm">{result.error}</p>
      )}
    </div>
  );
};

export default Pronunciation;