from urllib import response
from flask import Flask, jsonify, request

# 필요란 라이브러리 임포트
from tensorflow.keras.models import load_model
import sklearn
import numpy as np
import pandas as pd
import seaborn as sns

import matplotlib
matplotlib.use('agg')
import matplotlib.pyplot as plt

import os, json, math, librosa
#아나콘다 오류로 인해 코드 추가
# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
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


# 저장된 모델 가져오기
model = load_model('./CarpeModel.h5')
# model.summary()

# 데이터 가져오기
DATA_PATH = "./data_10.json"

# 함수 정의

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
    
    # print("c_code : ", predicted_index)

    # get mappings for target and predicted label
    target = z[y]
    predicted = z[predicted_index]
    print("이게머람?! {}".format(predicted_index[0]))
    
    print("실제 장르: {}, 머신러닝이 분류한 장르: {}".format(target, predicted))

    data = {
        'message' : "실제 장르: {}, 머신러닝이 분류한 장르: {}".format(target, predicted),
        'predict_genre' : str(predicted[0]),
        'c_code' : int(predicted_index[0]),
    }

    print("데이터", data)
    print("데이터 타입", type(data))

    # return("{}".format(predicted))
    return(data)
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

X, y, z = load_data(DATA_PATH)
app = Flask(__name__)



# 음원 데이터 장르분류 API
@app.route("/predict", methods=['POST'])
def predictGenres():

    # 요청 데이터
    # 1. 카테고리 코드, 파일명, 카테고리명(영어)
    reqData = request.json
    file_path = './src/public/Data/genres_original/'+reqData["categoryName"]+'/'+reqData["fileName"]

    # librosa 파라미터 값 셋팅
    SAMPLE_RATE = 22050
    TRACK_DURATION = 30 # measured in seconds
    SAMPLES_PER_TRACK = SAMPLE_RATE * TRACK_DURATION
    num_mfcc=13
    n_fft=2048
    hop_length=512
    num_segments=5

    # 분석할 데이터 껍데기
    new_test_data = {
        "mapping": [],
        "labels": [],
        "mfcc": []
    }

    samples_per_segment = int(SAMPLES_PER_TRACK / num_segments)
    num_mfcc_vectors_per_segment = math.ceil(samples_per_segment / hop_length)
    
    signal, sample_rate = librosa.load(file_path, sr=SAMPLE_RATE)
    for d in range(num_segments):
        start = samples_per_segment * d
        finish = start + samples_per_segment
        mfcc = librosa.feature.mfcc(signal[start:finish], sample_rate, n_mfcc=num_mfcc, n_fft=n_fft, hop_length=hop_length)
        mfcc = mfcc.T
        if len(mfcc) == num_mfcc_vectors_per_segment:
            new_test_data["mfcc"].append(mfcc.tolist())
            new_test_data["labels"].append("2")
            print("{}, segment:{}".format(file_path, d+1))

    X_test2 = np.array(new_test_data["mfcc"])
    y_test2 = np.array(new_test_data["labels"])
    z_test2 = np.array(new_test_data['mapping'])
    resizeData = np.resize(X_test2, (216,13,1))
        
    predictMessage = predict(model, resizeData, reqData['c_code'])

    response = {
        'message': predictMessage,
    }
    return jsonify(predictMessage),200

# 음원데이터 특징추출 이미지 저장
@app.route("/features", methods=['POST'])
def features():

    # 요청 데이터
    # 2.파일명, 카테고리명(영어)
    reqData = request.json
    path = './src/public/Data/'
    y, sr = librosa.load(os.path.join(path, 'genres_original', reqData['categoryName'], reqData['fileName']))

    n_fft = 2048
    hop_length = 512
    chromagram = librosa.feature.chroma_stft(y, sr=sr, hop_length=hop_length)
    mfccs = librosa.feature.mfcc(y, sr=sr)
    mfccs = sklearn.preprocessing.scale(mfccs,axis=1)
    S = librosa.feature.melspectrogram(y, sr = sr)
    # 진폭 스펙트로그램을 데시벨(dB) 스케일 스펙트로 그램으로 변환해줌
    S_DB = librosa.amplitude_to_db(S, ref= np.max) 


    # 진폭(선형 척도)에서 데시벨(로그 척도)로 변환
    audio,_ = librosa.effects.trim(y)
    music_stft = np.abs(librosa.stft(audio,n_fft=n_fft,hop_length= hop_length))
    music_stft_decibels = librosa.amplitude_to_db(music_stft, ref= np.max) 


    # 다중 그래프 하나로 보여주기 위해 전처리
    fig, ax = plt.subplots(nrows=5, ncols=1)
    # 격자 크기 설정
    fig.set_size_inches((12, 17))
    # 격자 여백 설정
    plt.subplots_adjust(wspace = 0.4, hspace = 0.4)

    # 한글 설정
    # plt.rc('font', family='AppleGothic') # For MacOS
    # plt.rc('font', family='MalgunGothic') # For Windows

    img0 = librosa.display.waveshow(y=y,sr=sr,color='r', ax=ax[0])
    ax[0].set(title='Your Song Graph')
    img1 = librosa.display.specshow(mfccs, sr=sr, x_axis='time', cmap = 'cool', ax=ax[1])
    ax[1].set(title='MFCCS')
    img2 = librosa.display.specshow(chromagram, x_axis='time', y_axis='chroma', hop_length=hop_length,cmap='coolwarm', ax=ax[2]);
    ax[2].set(title='Chroma feature(Pitch)')
    img3 = librosa.display.specshow(S_DB, sr = sr, hop_length=hop_length, x_axis='time', y_axis='log', cmap='cool', ax=ax[3])
    ax[3].set(title='Mel spectrogram')
    img4 = librosa.display.specshow(music_stft_decibels, sr = sr, hop_length= hop_length, x_axis='time', y_axis='log', cmap = "magma", ax=ax[4]);
    ax[4].set(title='Convert from amplitude (linear scale) to decibels (log scale)')

    newImageName = reqData['fileName'].rstrip('.wav') + '.png'
    plt.savefig("src/public/Data/images/" + newImageName)

    response = {
        'image': newImageName,
    }
    return jsonify(response),200