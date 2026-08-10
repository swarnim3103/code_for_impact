// src/RecurringPatterns.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecurringPatterns = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/recurring-feedback')
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setError('Could not load your progress. Is the backend running?');
      });
  }, []);

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;
  if (!data) return <p className="text-gray-500 text-center mt-10">Loading your progress...</p>;

  return (
    <div className="flex flex-col items-center justify-center mt-10 mb-10">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Your Patterns</h1>

        <div className="bg-customBrown4 p-4 rounded-lg mb-6 text-center">
          <p className="text-gray-800">{data.feedback}</p>
        </div>

        {data.recurring_errors.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Recurring Sound Swaps</h2>
            <ul className="space-y-1">
              {data.recurring_errors.map((e, i) => (
                <li key={i} className="text-gray-600">
                  {e.expected} → {e.actual} <span className="text-sm text-gray-400">({e.count}×)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.words_needing_practice.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Words to Practice</h2>
            <ul className="list-disc ml-5">
              {data.words_needing_practice.map((w, i) => (
                <li key={i} className="text-gray-600">
                  {w.word} <span className="text-sm text-gray-400">(missed {w.misses}×)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringPatterns;