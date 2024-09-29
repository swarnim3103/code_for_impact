from datasets import load_dataset
import librosa
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle

ds = load_dataset("jmaczan/TORGO")

def extract_features(audio_sample):
    y, sr = audio_sample['array'], audio_sample['sampling_rate']
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return np.mean(mfccs.T, axis=0)

X, y = [], []

for sample in ds['train']:
    mfccs = extract_features(sample['audio'])
    X.append(mfccs)

    transcription = sample['transcription']
    
    if '...' in transcription:  
        y.append(1)  
    else:
        y.append(0)  

clf = RandomForestClassifier()
clf.fit(X, y)

with open('speech_impediment_model.pkl', 'wb') as f:
    pickle.dump(clf, f)

print("Model training complete and saved as 'speech_impediment_model.pkl'")
