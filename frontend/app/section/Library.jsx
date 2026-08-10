// src/WordLibrary.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES = ['Overcome', 'Achievement', 'Special Care'];

const Library = () => {
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('Overcome');
  const [library, setLibrary] = useState({ Overcome: [], Achievement: [], 'Special Care': [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLibrary = async () => {
    try {
      const response = await axios.get('http://localhost:5000/library');
      setLibrary(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not load library. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleInputChange = (e) => setWord(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);

  const addWordToLibrary = async () => {
    if (!word.trim()) return;
    try {
      const response = await axios.post('http://localhost:5000/library', {
        word: word.trim(),
        category,
      });
      setLibrary(response.data);
      setWord('');
    } catch (err) {
      console.error(err);
      setError('Could not save word.');
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
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={addWordToLibrary}
          className="bg-customBrown text-white p-3 rounded-lg hover:bg-customBrown2 transition duration-300 ease-in-out ml-10"
        >
          Add to Library
        </button>

        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
        {loading && <p className="mt-4 text-gray-500 text-sm">Loading...</p>}

        <div className="mt-6">
          {Object.entries(library).map(([cat, words]) => (
            <div key={cat} className="mb-4">
              <h2 className="text-xl font-semibold text-gray-700">{cat}</h2>
              {words.length === 0 ? (
                <p className="text-gray-400 text-sm">No words yet</p>
              ) : (
                <ul className="list-disc ml-5">
                  {words.map((w, index) => (
                    <li key={index} className="text-gray-600">{w}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Library;