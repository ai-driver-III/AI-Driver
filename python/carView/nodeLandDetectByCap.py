import cv2
import numpy as np
import sys, time, logging
import base64
import multiprocessing as mp

### self defined class
from carViewLibV2 import runWithFPS
from carViewLibV2 import landMark, traceMark
from carViewLibV2 import CarView, landShift
from yolo4tiny import Yoylv4Tiny
# ### self defined class
# from carViewLib import runWithFPS
# from carViewLib import landMark, traceMark
# from carViewLib import CarView, landShift
# logging.basicConfig(level=logging.DEBUG)
# logging.basicConfig(level=logging.ERROR)

def getCap():
    try:
        fileName = sys.argv[1]
        webcam = cv2.VideoCapture(fileName)
        # webcam = cv2.VideoCapture("http://192.168.1.103:8000")
        logging.debug(f"File {fileName} open success")
        # print(f"File {fileName} open success")
        videoFps = webcam.get(cv2.CAP_PROP_FPS)
        # videoFrameTime = 1.0/videoFps
        logging.debug ("Frames per second using video.get(cv2.CAP_PROP_FPS) : {:.1f}".format(videoFps))    
        # print("Frames per second using video.get(cv2.CAP_PROP_FPS) : {:.1f}".format(videoFps))    
    except IndexError:
        logging.debug("file open failed, try opening camera...")
        # print("file open failed, try opening camera...")
        # webcam = cv2.VideoCapture(1)
        webcam = cv2.VideoCapture("http://192.168.1.109:8000")
        # webcam.set(cv2.CAP_PROP_FRAME_WIDTH, 640.0)
        # webcam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480.0)
        videoFrameTime = 1.0/30.0 ### temperally set to 1/30 sec
    return webcam

def main():
    fps = runWithFPS()
    traceMarkL = traceMark()
    traceMarkR = traceMark()
    landShiftObj = landShift()
    carView = CarView()
    webcam = getCap()
    yolo = Yoylv4Tiny()
    try:
        if sys.argv[2]=="loop":
            isLoop = True
    except:
        isLoop = False
    num = 0
    while num !="-1": # set num = -1 to end this script
        fps.start()
        ret , frame = webcam.read()
        if not ret: # end of video
            if isLoop:
                webcam.set(cv2.CAP_PROP_POS_FRAMES, 0) # red video frame from 0
                _, frame = webcam.read()
            else:
                break
        ### yolo4 tiny detect
        classes, confs, boxes, objPts = yolo.nnProcess(frame)
        fps.deltaTime("yolo process")
        distList, warpPoints = carView.getObjDistance(objPts)
        # frame = yolo.drawBox(frame, classes, confs, boxes)
        ### analysis frame and do car land recognition
        debugFrame, acm = carView.process(frame, traceMarkL, traceMarkR, landShiftObj, fps=fps, debugMode=True)
        fps.deltaTime("carView process")
        ### for debug obj distance
        ### get velocity land shift and send out
        shiftVel = landShiftObj.getVelocity()
        velL = traceMarkL.getMedVelocity()
        velL = 0 if velL == None else velL
        velR = traceMarkR.getMedVelocity()
        velR = 0 if velR == None else velR
        landPts = landShiftObj.getUnwarpPts()
        ### transfer frame to base64 image string
        ret, jpeg = cv2.imencode('.jpg', frame)
        rJpeg = jpeg.tobytes()
        rJpeg = base64.b64encode(rJpeg).decode('utf-8')
        ### prepare feedback data
        outMsg = f'"inputID":{num}, "landShift": "{shiftVel:.1f}", "velocity": "{(velL+velR)/2:.1f}"'
        outMsg += f', "landPts":"{landPts}"'
        outMsg += f', "classes":"{classes}"'
        outMsg += f', "boxes":"{boxes}"'
        outMsg += f', "confs":"{confs}"'
        outMsg += f', "distList":"{distList}"'
        # outMsg += f', "image":"{rJpeg}"'
        outMsg = "{"+outMsg+"}"
        print(outMsg)
        ### debug mode
        debug = carView.processObjPos(acm, warpPoints)
        debugFrame = cv2.vconcat([debugFrame,debug])
        num+=1
        k = cv2.waitKey(1)
        if k == 27 or k == ord('q'):
            break
        cv2.imshow("debug", debugFrame)
        # if int(num) >50:
        #     break
        # cv2.imwrite(f"./carView/saveImg/debug{num}.jpg", debugFrame)
        fps.deltaTime("end process")
if __name__=="__main__":
    main()