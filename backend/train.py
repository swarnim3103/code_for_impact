import io
from datasets import load_dataset, Audio
import librosa
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import pickle

ds = load_dataset("abnerh/TORGO-database")

# Key fix: tell datasets NOT to auto-decode audio via torchcodec.
# We'll decode the raw bytes ourselves with librosa instead.
ds = ds.cast_column("audio", Audio(decode=False))


def extract_features(audio_field):
    # audio_field is now a dict like {'bytes': b'...', 'path': '...'}
    audio_bytes = audio_field["bytes"]
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return np.mean(mfccs.T, axis=0)


X, y = [], []

total = len(ds['train'])
for i, sample in enumerate(ds['train']):
    if i % 1000 == 0:
        print(f"Processing {i}/{total}...")
    try:
        mfccs = extract_features(sample['audio'])
    except Exception as e:
        print(f"Skipping sample {i}: {e}")
        continue
    X.append(mfccs)
    y.append(1 if sample['speech_status'] == 'dysarthria' else 0)

X = np.array(X)
y = np.array(y)

print(f"\nTotal usable samples: {len(y)}  |  Positive (dysarthria) rate: {y.mean():.2%}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

clf = RandomForestClassifier(random_state=42)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)

print("\n--- Evaluation on held-out test set ---")
print(f"Accuracy:  {accuracy_score(y_test, y_pred):.3f}")
print(f"Precision: {precision_score(y_test, y_pred, zero_division=0):.3f}")
print(f"Recall:    {recall_score(y_test, y_pred, zero_division=0):.3f}")
print(f"F1 score:  {f1_score(y_test, y_pred, zero_division=0):.3f}")
print("\n" + classification_report(y_test, y_pred, zero_division=0))

with open('speech_impediment_model.pkl', 'wb') as f:
    pickle.dump(clf, f)

print("Model training complete and saved as 'speech_impediment_model.pkl'")