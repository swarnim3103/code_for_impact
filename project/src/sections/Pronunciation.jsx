// src/Pronunciation.js
import React, { useState } from 'react';

const Pronunciation = () => {
  const [word, setWord] = useState('');

  const handleInputChange = (e) => {
    setWord(e.target.value);
  };

  const pronounceWord = () => {
    if (word) {
      const utterance = new SpeechSynthesisUtterance(word);
      speechSynthesis.speak(utterance);
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
        className="p-2 border border-gray-300 rounded mb-4"
      />
      <div className='flex'>
      <button
        onClick={pronounceWord}
        className="bg-customBrown hover:bg-customBrown2 text-white p-2 rounded  mr-10"
      >
        Pronounce
      </button>
      <button
        onClick={pronounceWord}
        className="bg-customBrown hover:bg-customBrown2 text-white p-2 rounded"
      >
        Add to Library
      </button>
      </div>
      
    </div>
  );
};

export default Pronunciation;
