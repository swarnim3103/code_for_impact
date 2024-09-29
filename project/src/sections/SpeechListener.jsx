import React, { useState } from 'react';

const SpeechListener = () => {
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');

    const startListening = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;  // Change to true if you want continuous listening
        recognition.interimResults = false;

        recognition.onresult = async (event) => {
            const speechText = event.results[event.results.length - 1][0].transcript;
            setTranscript(speechText);
            await checkForSpeechProblems(speechText);
        };

        recognition.onerror = (event) => {
            console.error('Error occurred in recognition: ' + event.error);
        };

        recognition.start();
    };

    const checkForSpeechProblems = async (text) => {
        try {
            const response = await fetch('http://localhost:5000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transcript: text }),
            });

            const data = await response.json();
            setFeedback(data.problem_detected ? 'Speech issues detected' : 'Speech is clear');
        } catch (error) {
            console.error('Error checking for speech problems:', error);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">SpeechEase</h1>
            <button 
                onClick={startListening} 
                className="bg-customBrown hover:bg-customBrown2 text-white font-bold py-2 px-4 rounded"
            >
                Start Listening
            </button>
            <div className="mt-4">
                <h2 className="text-xl font-semibold">Transcript:</h2>
                <p className="p-4 bg-gray-100 rounded"style={{ height: '100px' }}>{transcript}</p>
            </div>
            <div className="mt-4">
                <h2 className="text-xl font-semibold">Feedback:</h2>
                <p className={`p-4 ${feedback.includes('issues') ? 'bg-red-200' : 'bg-customBrown4'} rounded`} style={{ height: '100px' }}>
                    {feedback}
                </p>
            </div>
        </div>
    );
};

export default SpeechListener;
