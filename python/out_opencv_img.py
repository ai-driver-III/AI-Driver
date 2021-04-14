import cv2
import base64
# 載入分類器
# face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
# 從視訊盡頭擷取影片
cap = cv2.VideoCapture(0)
# 或者....
# 使用現有影片
# cap = cv2.VideoCapture('filename.mp4')
i = 0
while i<5:
    i+=1
    # Read the frame
    _, img = cap.read()
# 轉成灰階
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# 偵測臉部
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
# 繪製人臉部份的方框
    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
        # 顯示成果
    ret, jpeg = cv2.imencode('.jpg', img)
    # cv2.imwrite('./public/images/output.jpg', img)
    rJpeg = jpeg.tobytes()
    rJpeg = base64.b64encode(rJpeg).decode('utf-8')
    print(rJpeg)
    # cv2.namedWindow('img', cv2.WINDOW_NORMAL)  #正常視窗大小
# Release the VideoCapture object
cap.release()