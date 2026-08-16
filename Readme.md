# SpeechEase

SpeechEase is a speech-practice web app. Users type a target word, speak it aloud, and get phoneme-level feedback comparing what they said to the expected pronunciation. It tracks recurring pronunciation errors over time and lets users build a personal word library.

Live demo: https://code-for-impact.vercel.app/

## Features

- Text-to-speech playback of target words
- Browser speech recognition to capture what the user actually said
- Phoneme-level comparison (CMU Pronouncing Dictionary + edit-distance alignment) with specific feedback on substitutions, deletions, and insertions
- ML-based speech pattern detection from raw audio (Random Forest classifier trained on MFCC features from the TORGO dataset)
- Personal word library, organized into Overcome, Achievement, and Special Care categories
- Recurring-error pattern tracking across sessions
- User accounts with JWT-based authentication; browsing is open to guests, saving requires an account

## Tech Stack

**Backend**
- Flask (Python)
- SQLite
- bcrypt for password hashing
- PyJWT for session tokens
- librosa, numba, and scikit-learn for the audio classifier
- pydub + ffmpeg for decoding browser-recorded audio (WebM/Opus) before feature extraction
- pronouncing (CMU Pronouncing Dictionary) for phoneme comparison
- gunicorn as the production WSGI server

**Frontend**
- React Router v7 (Vite)
- Tailwind CSS
- Axios

**Infrastructure**
- Backend containerized with Docker, deployed on Render
- Frontend deployed on Vercel

## Project Structure

```
speechease/
├── backend/
│   ├── app.py                Flask routes
│   ├── auth.py                Signup, login, JWT handling
│   ├── error.py                Attempt logging, recurring-error queries, library storage
│   ├── phonetic.py             Phoneme comparison logic
│   ├── train.py                 Trains the audio classifier
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
│
└── frontend/
    └── app/
        ├── constant/          Nav link definitions
        ├── context/            AuthContext (login state, token storage, API_BASE)
        ├── hooks/               useSpeechRecognition (shared recognition logic)
        ├── routes/              Route entry points
        ├── section/             Page components
        ├── app.css
        └── root.tsx
```

## Prerequisites

- Python 3.10 or later
- Node.js 18 or later
- ffmpeg installed and on your system PATH (required to decode audio recorded by the browser's MediaRecorder API before feature extraction)
- A browser that supports the Web Speech API (Chrome or Edge recommended; Firefox and Safari have limited support)

To check ffmpeg is available:

```bash
ffmpeg -version
```

If this fails, install it. On Windows:

```powershell
winget install ffmpeg
```

then close and reopen your terminal completely before retrying (PATH changes only apply to new terminal sessions). On macOS: `brew install ffmpeg`. On Linux: `apt install ffmpeg` or your distro's equivalent.

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

Open `.env` and set a real value for `JWT_SECRET`. Generate one with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

`FRONTEND_ORIGIN` should be `http://localhost:3000` for local development.

Start the server:

```bash
python app.py
```

The API runs at `http://localhost:5000`. On first run it creates `speechease.db` automatically with the required tables.

Note: the reloader is disabled (`use_reloader=False`) in `app.py`. On some Windows setups the default Werkzeug reloader can detect false-positive file changes inside site-packages and restart the server mid-request, which surfaces as a connection reset on the client. If you re-enable the reloader for active development, be aware of this failure mode.

**Train the audio classifier**

The `/predict` endpoint needs a trained model. This step is optional for everything except `/predict`; the rest of the app works without it.

```bash
python train.py
```

This downloads the TORGO dataset and trains a Random Forest classifier on MFCC features, saving `speech_impediment_model.pkl` in the `backend` folder. Restart `app.py` afterward so it picks up the model.

Current held-out test set performance (3,311 samples):

| Metric | Score |
|---|---|
| Accuracy | 92.8% |
| Precision | 95.7% |
| Recall | 82.3% |
| F1 score | 88.5% |

Recall is lower than precision, meaning the model is more conservative about flagging dysarthria-positive samples than it is accurate when it does flag them. This is a real tradeoff, not a bug, worth being aware of before relying on `/predict` output for anything beyond a demo.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
VITE_API_BASE=http://localhost:5000
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
- Recording audio and clicking Send for Analysis should return a speech-clear/speech-issues result if a trained model is present.

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

## Deployment

### Backend (Render)

The backend is containerized since the audio pipeline depends on ffmpeg, which is not available in Render's native Python buildpack.

1. `backend/Dockerfile` installs ffmpeg, installs Python dependencies, and runs the app with gunicorn.
2. On Render: create a Web Service, connect the repo, set Root Directory to `backend`, and let Render detect the Dockerfile (Docker environment).
3. Set environment variables in the Render dashboard:
   - `JWT_SECRET`: a fresh secret, generated the same way as local, but distinct from your local value
   - `FRONTEND_ORIGIN`: your deployed Vercel URL
4. Commit `speech_impediment_model.pkl` to the repo so it's present in the built image; without it, `/predict` returns a 503 rather than failing to build.

**Known limitation of the current deployment**: the free Render instance type does not support persistent disks, and this project is currently deployed without one. This means the SQLite database resets on every redeploy and on any restart Render performs after the free instance spins down from inactivity. Accounts, library words, and practice history do not persist long-term in the current deployment. For a persistent deployment, either upgrade to a paid Render instance with an attached disk, or migrate to a managed database such as Render Postgres.

Free instances also spin down after 15 minutes without traffic and take up to a minute to wake on the next request; expect a cold-start delay on first load after inactivity.

### Frontend (Vercel)

1. `API_BASE` throughout the frontend is read from `VITE_API_BASE`, not hardcoded.
2. On Vercel: import the repo, set Root Directory to `frontend`, and set the environment variable:
   - `VITE_API_BASE`: the deployed Render backend URL
3. After the first deploy, update the backend's `FRONTEND_ORIGIN` environment variable on Render to match the real Vercel URL so CORS allows requests from it.

## Known Scope Limitations

- Pronunciation comparison works on the text output of the browser's speech recognizer, not raw acoustic phonemes. This is a legitimate, explainable lightweight technique, but it is downstream of whatever the browser's recognizer produces, not a from-scratch acoustic classifier.
- Audio recorded via MediaRecorder is captured as WebM/Opus, not WAV. The backend converts it with pydub (via ffmpeg) before running feature extraction; ffmpeg must be present in both local and deployed environments for `/predict` to function.
- The Random Forest classifier has meaningfully lower recall (82.3%) than precision (95.7%) on the positive class. It is more likely to miss a true positive than to falsely flag a negative one. Treat `/predict` output as a demo-quality signal, not a diagnostic tool.
- SQLite is used for simplicity, and the current deployment runs without persistent storage, so data does not survive redeploys or free-tier instance restarts. Migrate to PostgreSQL and attach durable storage for any deployment where retained user data matters.
- The Web Speech API is not supported in all browsers. Safari and Firefox support is limited or absent.
- Speech recognition requires an active internet connection even during local development, since browser speech-to-text is not processed on-device.