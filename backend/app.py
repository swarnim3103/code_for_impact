from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import librosa
import numpy as np
import pickle
import os
import io
from pydub import AudioSegment

from phonetic import analyze_pronunciation
from auth import init_auth_db, signup, login, require_auth, optional_auth
from error import (
    init_db,
    log_attempt,
    generate_personalized_feedback,
    get_recurring_errors,
    get_words_needing_practice,
    add_library_word,
    get_library,
)

load_dotenv()

app = Flask(__name__)
DB_PATH = os.environ.get("DB_PATH", "speechease.db")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
CORS(app, resources={r"/*": {"origins": FRONTEND_ORIGIN}})

init_db()
init_auth_db()

MODEL_PATH = "speech_impediment_model.pkl"
model = None
if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)




def extract_features(audio_file_storage):
    # audio_file_storage is a werkzeug FileStorage (from request.files["file"]).
    # pydub shells out to ffmpeg directly, which reliably handles WebM/Opus
    # from MediaRecorder -- more reliable here than librosa's own fallback chain.
    audio_file_storage.seek(0)
    audio_segment = AudioSegment.from_file(audio_file_storage)
    audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)

    # Convert to a WAV byte buffer librosa/soundfile can read natively.
    wav_buffer = io.BytesIO()
    audio_segment.export(wav_buffer, format="wav")
    wav_buffer.seek(0)

    y, sr = librosa.load(wav_buffer, sr=16000)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return np.mean(mfccs.T, axis=0)


# ---------- Auth ----------

@app.route("/auth/signup", methods=["POST"])
def auth_signup():
    payload = request.get_json(force=True) or {}
    email = payload.get("email", "")
    password = payload.get("password", "")
    result, status = signup(email, password)
    return jsonify(result), status


@app.route("/auth/login", methods=["POST"])
def auth_login():
    payload = request.get_json(force=True) or {}
    email = payload.get("email", "")
    password = payload.get("password", "")
    result, status = login(email, password)
    return jsonify(result), status


# ---------- ML prediction ----------

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


# ---------- Pronunciation analysis ----------
# Browsable without login. Only logs the attempt (writes to DB) if logged in.

@app.route("/analyze-pronunciation", methods=["POST"])
@optional_auth
def analyze():
    payload = request.get_json(force=True) or {}
    target_word = payload.get("target_word", "").strip()
    transcribed_word = payload.get("transcribed_word", "").strip()

    if not target_word or not transcribed_word:
        return jsonify({"error": "target_word and transcribed_word are required"}), 400

    result = analyze_pronunciation(target_word, transcribed_word)

    if request.user_id is not None:
        log_attempt(result, user_id=request.user_id)

    result["logged"] = request.user_id is not None
    return jsonify(result)


# ---------- Patterns / recurring feedback ----------
# Requires login -- there is nothing to show a guest, this is per-user history.

@app.route("/recurring-feedback", methods=["GET"])
@require_auth
def recurring_feedback():
    return jsonify({
        "feedback": generate_personalized_feedback(request.user_id),
        "recurring_errors": get_recurring_errors(request.user_id),
        "words_needing_practice": get_words_needing_practice(request.user_id),
    })


# ---------- Library ----------
# Browsable (returns empty state) without login. Saving requires login.

@app.route("/library", methods=["GET"])
@optional_auth
def library_get():
    if request.user_id is None:
        return jsonify({"Overcome": [], "Achievement": [], "Special Care": [], "guest": True})
    return jsonify(get_library(request.user_id))


@app.route("/library", methods=["POST"])
@require_auth
def library_post():
    payload = request.get_json(force=True) or {}
    word = payload.get("word", "").strip()
    category = payload.get("category", "").strip()

    if not word or category not in ("Overcome", "Achievement", "Special Care"):
        return jsonify({"error": "word and a valid category are required"}), 400

    add_library_word(word, category, user_id=request.user_id)
    return jsonify(get_library(request.user_id))

if __name__ == "__main__":
    app.run()