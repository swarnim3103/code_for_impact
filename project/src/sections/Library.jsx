// src/WordLibrary.js
import React, { useState } from 'react';

const Library = () => {
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('Overcome');
  const [library, setLibrary] = useState({
    Overcome: [],
    Achievement: [],
    'Special Care': [],
  });

  const handleInputChange = (e) => {
    setWord(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const addWordToLibrary = () => {
    if (word.trim()) {
      setLibrary((prevLibrary) => ({
        ...prevLibrary,
        [category]: [...prevLibrary[category], word],
      }));
      setWord(''); // Clear input field after adding
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Word Library</h1>
        
        <input
          type="text"
          value={word}
          onChange={handleInputChange}
          placeholder="Enter a word"
          className="p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600 mr-10"
        />
        
        <select
          value={category}
          onChange={handleCategoryChange}
          className="p-3 border border-gray-300 rounded-lg mb-4"
        >
          <option value="Overcome">Overcome</option>
          <option value="Achievement">Achievement</option>
          <option value="Special Care">Special Care</option>
        </select>

        <button
          onClick={addWordToLibrary}
          className="bg-customBrown text-white p-3 rounded-lg hover:bg-customBrown2 transition duration-300 ease-in-out ml-10"
        >
          Add to Library
        </button>

        {/* Display Words */}
        <div className="mt-6">
          {Object.entries(library).map(([cat, words]) => (
            <div key={cat} className="mb-4">
              <h2 className="text-xl font-semibold text-gray-700">{cat}</h2>
              <ul className="list-disc ml-5">
                {words.map((w, index) => (
                  <li key={index} className="text-gray-600">{w}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Library;
