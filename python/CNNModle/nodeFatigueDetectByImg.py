import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
import base64

def cv_img_2_tf_img(img):
    img_cv = cv2.imencode('.jpg', img)[1]
    data_encode = np.array(img_cv)
    str_encode = data_encode.tobytes()
    img_tf = tf.image.decode_jpeg(str_encode, channels=0)
    return img_tf

def main():
    model = keras.models.load_model('./python/CNNModle/driver_model_new.h5')
    # print(model.summary())
    while True:
        lines = input() ### This's for multiple input from node
        lineL = lines.split(",")
        num = lineL[0]
        lines = lineL[1]
        lines = base64.b64decode(lines)
        lines = np.frombuffer(lines, dtype="uint8").reshape(-1,1)
        ### reconstruct image as an numpy array
        frame = cv2.imdecode(lines, cv2.IMREAD_UNCHANGED)
        ### resize to tf format
        frame = cv2.resize(frame, (400, 600))
        tf_img = cv_img_2_tf_img(frame)
        tf_img = tf.keras.preprocessing.image.img_to_array(tf_img)
        tf_img = tf_img / 255.0  # normalize
        tf_img = np.expand_dims(tf_img, axis=0)
        result = model.predict(tf_img)
        score = result[0][1]/(result[0][0]+result[0][1])
        outMsg = f'"inputID":{num},"score":{score}'
        outMsg = "{"+outMsg+"}"
        print(outMsg)
        # 第一個數字為正常，第二個數字為疲勞
        # if np.argmax(result) == 0:
        #     print('normal person')
        # else:
        #     print('tired person')

if __name__=="__main__":
    main()