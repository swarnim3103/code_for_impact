# SpeechEase

SpeechEase is a speech-practice web app. Users type a target word, speak it aloud, and get phoneme-level feedback comparing what they said to the expected pronunciation. It tracks recurring pronunciation errors over time and lets users build a personal word library.

## Features

- Text-to-speech playback of target words
- Browser speech recognition to capture what the user actually said
- Phoneme-level comparison (CMU Pronouncing Dictionary + edit-distance alignment) with specific feedback on substitutions, deletions, and insertions
- Optional ML-based speech pattern detection from raw audio (RandomForest classifier trained on the TORGO dataset)
- Personal word library, organized into Overcome, Achievement, and Special Care categories
- Recurring-error pattern tracking across sessions
- User accounts with JWT-based authentication; browsing is open to guests, saving requires an account

## Tech Stack

**Backend**
- Flask (Python)
- SQLite
- bcrypt for password hashing
- PyJWT for session tokens
- librosa and scikit-learn for the audio classifier
- pronouncing (CMU Pronouncing Dictionary) for phoneme comparison

**Frontend**
- React Router v7 (Vite)
- Tailwind CSS
- Axios

## Project Structure

```
speechease/
├── backend/
│   ├── app.py              Flask routes
│   ├── auth.py              Signup, login, JWT handling
│   ├── error.py              Attempt logging, recurring-error queries, library storage
│   ├── phonetic.py           Phoneme comparison logic
│   ├── train.py               Trains the optional audio classifier
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    └── app/
        ├── constant/          Nav link definitions
        ├── context/            AuthContext (login state, token storage)
        ├── hooks/               useSpeechRecognition (shared recognition logic)
        ├── routes/              Route entry points
        ├── section/             Page components
        ├── app.css
        └── root.tsx
```

## Prerequisites

- Python 3.10 or later
- Node.js 18 or later
- A browser that supports the Web Speech API (Chrome or Edge recommended; Firefox and Safari have limited support)

## Local Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Open `.env` and set a real value for `JWT_SECRET` (any long random string). `FRONTEND_ORIGIN` should already be `http://localhost:3000`.

Start the server:

```bash
python app.py
```

The API runs at `http://localhost:5000`. On first run it creates `speechease.db` automatically with the required tables.

**Optional: enable the audio classifier**

The `/predict` endpoint needs a trained model. This step is optional; the rest of the app works without it.

```bash
python train.py
```

This downloads the TORGO dataset and trains a RandomForest classifier, saving `speech_impediment_model.pkl` in the `backend` folder. Restart `app.py` afterward so it picks up the model.

### 2. Frontend

```bash
cd frontend
npm install
```

By default, React Router's Vite dev server runs on port 5173. Since the backend's CORS is locked to port 3000, either add this to `vite.config.ts`:

```ts
export default defineConfig({
  server: { port: 3000 },
});
```

or run:

```bash
npm run dev -- --port 3000
```

Then visit `http://localhost:3000`.

## Verifying It Works

- `http://localhost:5000/library` should return an empty library object.
- `http://localhost:3000` should load the marketing home page.
- `http://localhost:3000/signup` should let you create an account.
- After logging in, `http://localhost:3000/dashboard` should show your email in the nav bar and allow saving library words and viewing patterns.

## API Overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | none | Create an account, returns a token |
| POST | `/auth/login` | none | Log in, returns a token |
| POST | `/analyze-pronunciation` | optional | Compare target vs. spoken word; logs the attempt if authenticated |
| GET | `/recurring-feedback` | required | Recurring error patterns and words needing practice |
| GET | `/library` | optional | Returns the user's library, or an empty guest library |
| POST | `/library` | required | Add a word to the library |
| POST | `/predict` | none | Audio-based speech pattern detection (requires trained model) |

Authenticated requests send `Authorization: Bearer <token>` in the request headers. The frontend's `AuthContext` handles this automatically.

## Known Scope Limitations

- Pronunciation comparison works on the text output of the browser's speech recognizer, not raw acoustic phonemes. This is a legitimate, explainable lightweight technique, but it is downstream of whatever the browser's recognizer produces, not a from-scratch acoustic classifier.
- SQLite is used for simplicity. For production traffic beyond a portfolio deployment, migrate to PostgreSQL.
- The Web Speech API is not supported in all browsers. Safari and Firefox support is limited or absent.
