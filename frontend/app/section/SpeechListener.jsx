import React, { useState } from 'react';
import axios from 'axios';

const SpeechListener = () => {
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null); 

    const startListening = () => {
        setIsListening(true);
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const speechText = event.results[event.results.length - 1][0].transcript;
            setTranscript(speechText);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Error occurred in recognition: ' + event.error);
            setIsListening(false);
        };

        recognition.start();
    };

    const startRecording = () => {
        setIsListening(true);

        // Use the MediaRecorder API to record audio
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    setAudioBlob(audioBlob); 
                };

                mediaRecorder.start();
                setTimeout(() => {
                    mediaRecorder.stop();
                    setIsListening(false);
                }, 5000);  
            })
            .catch(error => {
                console.error('Error accessing media devices:', error);
                setIsListening(false);
            });
    };

    const sendAudioForPrediction = async () => {
        if (!audioBlob) {
            setFeedback('No audio recorded yet');
            return;
        }

        const formData = new FormData();
        formData.append('file', audioBlob, 'speech.wav');

        try {
            const response = await axios.post('http://localhost:5000/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const { speech_impediment_detected } = response.data;
            setFeedback(speech_impediment_detected ? 'Speech issues detected' : 'Speech is clear');
        } catch (error) {
            console.error('Error sending audio for prediction:', error);
            setFeedback('Error analyzing speech');
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-bold mb-6 text-center text-custom2 animate-bounce">SpeechEase</h1>
<div>
     <button
                onClick={startRecording}
                disabled={isListening}
                className={`transition duration-500 ease-in-out transform hover:scale-105 ${isListening ? 'bg-gray-400 cursor-not-allowed' : 'bg-customBrown hover:bg-customBrown2'} text-white font-bold py-3 px-6 rounded mr-60 ml-80 mt-20`}
            >
                {isListening ? 'Recording...' : 'Start Recording'}
            </button>

            <button
                onClick={sendAudioForPrediction}
                className="transition duration-500 ease-in-out transform hover:scale-105 bg-custom hover:bg-customBrown text-white font-bold py-3 px-6 rounded mt-4"
            >
                Send for Analysis
            </button>
</div>
           

            <div className="mt-6 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto">
                <h2 className="text-2xl font-semibold mb-2 text-gray-700">Transcript:</h2>
                <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-md overflow-y-auto" style={{ height: '150px' }}>
                    {transcript || <span className="text-gray-400">No speech detected yet...</span>}
                </div>
            </div>

            <div className="mt-6 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto">
                <h2 className="text-2xl font-semibold mb-2 text-gray-700">Feedback:</h2>
                <div
                    className={`p-4 rounded-lg shadow-md border border-gray-300 text-center ${
                        feedback.includes('issues') ? 'bg-red-200 text-red-800 animate-pulse' : 'bg-customBrown4 text-green-800'
                    }`}
                    style={{ height: '100px' }}
                >
                    {feedback || <span className="text-gray-400">Awaiting feedback...</span>}
                </div>
            </div>
        </div>
    );
};

export default SpeechListener;
