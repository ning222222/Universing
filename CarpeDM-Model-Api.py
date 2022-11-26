from tensorflow.keras.models import load_model
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

import os, json, math, librosa

import IPython.display as ipd
import librosa.display

import tensorflow as tf
import tensorflow.python.keras as keras

from tensorflow.python.keras import Sequential
from tensorflow.python.keras.layers import Conv2D

import sklearn.model_selection as sk

from sklearn.model_selection import train_test_split

import warnings

warnings.filterwarnings('ignore')

model = load_model('./CarpeModel.h5')


# In[6]:


model.summary()


# In[26]:


DATA_PATH = "./data_10.json"

def predict(model, X, y):
    """Predict a single sample using the trained model
    :param model: Trained classifier
    :param X: Input data
    :param y (int): Target
    """

    # add a dimension to input data for sample - model.predict() expects a 4d array in this case
    X = X[np.newaxis, ...] # array shape (1, 130, 13, 1)

    # perform prediction
    prediction = model.predict(X)

    # get index with max value
    predicted_index = np.argmax(prediction, axis=1)
    
    # get mappings for target and predicted label
    target = z[y]
    predicted = z[predicted_index]

    print("Target: {}, Predicted label: {}".format(target, predicted))
    DATA_PATH = "./data_10.json"


def load_data(data_path):
    """Loads training dataset from json file.
        :param data_path (str): Path to json file containing data
        :return X (ndarray): Inputs
        :return y (ndarray): Targets
    """

    with open(data_path, "r") as fp:
        data = json.load(fp)

    X = np.array(data["mfcc"])
    y = np.array(data["labels"])
    z = np.array(data['mapping'])
    return X, y, z


# In[27]:


SAMPLE_RATE = 22050
TRACK_DURATION = 30 # measured in seconds
SAMPLES_PER_TRACK = SAMPLE_RATE * TRACK_DURATION
num_mfcc=13
n_fft=2048
hop_length=512
num_segments=5
    
# dictionary to store mapping, labels, and MFCCs
new_test_data = {
    "mapping": [],
    "labels": [],
    "mfcc": []
}

samples_per_segment = int(SAMPLES_PER_TRACK / num_segments)
num_mfcc_vectors_per_segment = math.ceil(samples_per_segment / hop_length)


# save genre label (i.e., sub-folder name) in the mapping
semantic_label = "ballade"
new_test_data["mapping"].append(semantic_label)
print("\nProcessing: {}".format(semantic_label))

		# load audio file

file_path = './app/src/public/Data/genres_original/ballade/if_you_chearin.wav'
print(file_path)
signal, sample_rate = librosa.load(file_path, sr=SAMPLE_RATE)
# process all segments of audio file
for d in range(num_segments):
    # calculate start and finish sample for current segment
    start = samples_per_segment * d
    finish = start + samples_per_segment

    # extract mfcc
    mfcc = librosa.feature.mfcc(signal[start:finish], sample_rate, n_mfcc=num_mfcc, n_fft=n_fft, hop_length=hop_length)
    mfcc = mfcc.T
    
    print(mfcc.shape)
    print(num_mfcc_vectors_per_segment)
    # store only mfcc feature with expected number of vectors
    if len(mfcc) == num_mfcc_vectors_per_segment:
        new_test_data["mfcc"].append(mfcc.tolist())
        new_test_data["labels"].append("2")
        print("{}, segment:{}".format(file_path, d+1))


# In[28]:


# print(new_test_data["mfcc"][0])
# print(new_test_data["labels"][0])

X_test2 = np.array(new_test_data["mfcc"])
y_test2 = np.array(new_test_data["labels"])
z_test2 = np.array(new_test_data['mapping'])


# In[29]:


resizeData = np.resize(X_test2, (216,13,1))
X, y, z = load_data(DATA_PATH)


# In[30]:


predict(model, resizeData, 4)


# In[25]:


print(z)


# In[ ]:





# In[ ]:




