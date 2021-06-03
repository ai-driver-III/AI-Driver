import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras


def cv_img_2_tf_img(img):
    img_cv = cv2.imencode('.jpg', img)[1]
    data_encode = np.array(img_cv)
    str_encode = data_encode.tobytes()
    img_tf = tf.image.decode_jpeg(str_encode, channels=0)
    return img_tf


cap = cv2.VideoCapture(0)
model = keras.models.load_model('driver_model_new.h5')
print(model.summary())
while True:
    ret, frame = cap.read()
    frame = cv2.resize(frame, (400, 600))
    tf_img = cv_img_2_tf_img(frame)
    tf_img = tf.keras.preprocessing.image.img_to_array(tf_img)
    tf_img = tf_img / 255.0  # normalize
    tf_img = np.expand_dims(tf_img, axis=0)
    result = model.predict(tf_img)
    print(result)
    # 第一個數字為正常，第二個數字為疲勞
    # if np.argmax(result) == 0:
    #     print('normal person')
    # else:
    #     print('tired person')
