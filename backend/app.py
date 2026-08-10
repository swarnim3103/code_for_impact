from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import numpy as np
import pickle
import os

from phonetic import analyze_pronunciation
from error import (
    init_db,
    log_attempt,
    generate_personalized_feedback,
    get_recurring_errors,
    get_words_needing_practice,
    add_library_word,
    get_library,
)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

init_db()

MODEL_PATH = "speech_impediment_model.pkl"
model = None
if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)


def extract_features(audio_data):
    y, sr = librosa.load(audio_data, sr=16000)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return np.mean(mfccs.T, axis=0)


@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not trained yet. Run train.py first."}), 503

    if "file" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["file"]
    try:
        mfccs = extract_features(audio_file)
    except Exception as e:
        return jsonify({"error": f"Could not process audio: {e}"}), 400

    prediction = model.predict([mfccs])
    return jsonify({"speech_impediment_detected": bool(prediction[0])})


@app.route("/analyze-pronunciation", methods=["POST"])
def analyze():
    payload = request.get_json(force=True) or {}
    target_word = payload.get("target_word", "").strip()
    transcribed_word = payload.get("transcribed_word", "").strip()

    if not target_word or not transcribed_word:
        return jsonify({"error": "target_word and transcribed_word are required"}), 400

    result = analyze_pronunciation(target_word, transcribed_word)
    log_attempt(result)
    return jsonify(result)


@app.route("/recurring-feedback", methods=["GET"])
def recurring_feedback():
    return jsonify({
        "feedback": generate_personalized_feedback(),
        "recurring_errors": get_recurring_errors(),
        "words_needing_practice": get_words_needing_practice(),
    })


@app.route("/library", methods=["GET"])
def library_get():
    return jsonify(get_library())


@app.route("/library", methods=["POST"])
def library_post():
    payload = request.get_json(force=True) or {}
    word = payload.get("word", "").strip()
    category = payload.get("category", "").strip()

    if not word or category not in ("Overcome", "Achievement", "Special Care"):
        return jsonify({"error": "word and a valid category are required"}), 400

    add_library_word(word, category)
    return jsonify(get_library())


if __name__ == "__main__":
    app.run(debug=True)