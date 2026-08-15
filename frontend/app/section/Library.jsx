import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API_BASE } from "../context/AuthContext";

const CATEGORIES = ["Overcome", "Achievement", "Special Care"];

const Library = () => {
  const [word, setWord] = useState("");
  const [category, setCategory] = useState("Overcome");
  const [library, setLibrary] = useState({ Overcome: [], Achievement: [], "Special Care": [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isAuthenticated, authHeader } = useAuth();

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/library`, { headers: authHeader() });
      setLibrary(response.data);
    } catch (err) {
      console.error(err);
      setError("Could not load library. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
    // Re-fetch whenever auth state changes (login/logout).
  }, [isAuthenticated]);

  const addWordToLibrary = async () => {
    if (!word.trim()) return;
    if (!isAuthenticated) {
      setError("Log in to add words to your library.");
      return;
    }
    setError("");
    try {
      const response = await axios.post(
        `${API_BASE}/library`,
        { word: word.trim(), category },
        { headers: authHeader() }
      );
      setLibrary(response.data);
      setWord("");
    } catch (err) {
      console.error(err);
      setError("Could not save word.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Word Library</h1>

        {!isAuthenticated && (
          <p className="text-sm text-gray-500 text-center mb-4">
            Log in to save words. You can still browse.
          </p>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word"
            className="flex-1 min-w-[140px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBrown"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addWordToLibrary}
          disabled={!isAuthenticated || !word.trim()}
          className="w-full bg-customBrown text-white p-3 rounded-lg hover:bg-customBrown2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Library
        </button>

        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
        {loading && <p className="mt-4 text-gray-500 text-sm">Loading...</p>}

        <div className="mt-6">
          {Object.entries(library)
            .filter(([key]) => key !== "guest")
            .map(([cat, words]) => (
              <div key={cat} className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">{cat}</h2>
                {!words || words.length === 0 ? (
                  <p className="text-gray-400 text-sm">No words yet</p>
                ) : (
                  <ul className="list-disc ml-5">
                    {words.map((w, index) => (
                      <li key={index} className="text-gray-600">
                        {w}
                      </li>
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