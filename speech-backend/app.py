from flask import Flask, request, jsonify
import librosa
import numpy as np
import pickle

app = Flask(__name__)

# Load the trained model
with open('speech_impediment_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Feature extraction function
def extract_features(audio_data):
    y, sr = librosa.load(audio_data, sr=16000)  # Assuming 16kHz
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return np.mean(mfccs.T, axis=0)

# Endpoint to predict speech impediments
@app.route('/predict', methods=['POST'])
def predict():
    audio_file = request.files['file']  # Get the uploaded audio file
    mfccs = extract_features(audio_file)
    
    # Make prediction
    prediction = model.predict([mfccs])
    
    return jsonify({
        'speech_impediment_detected': bool(prediction[0])
    })

if __name__ == '__main__':
    app.run(debug=True)
