from flask import Flask, request, jsonify
import librosa
import numpy as np
import pickle
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

with open('speech_impediment_model.pkl', 'rb') as f:
    model = pickle.load(f)


def extract_features(audio_data):
    y, sr = librosa.load(audio_data, sr=16000) 
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return np.mean(mfccs.T, axis=0)

@app.route('/predict', methods=['POST'])
def predict():
    audio_file = request.files['file'] 
    mfccs = extract_features(audio_file)
    
    
    prediction = model.predict([mfccs])
    
    return jsonify({
        'speech_impediment_detected': bool(prediction[0])
    })

if __name__ == '__main__':
    app.run(debug=True)
