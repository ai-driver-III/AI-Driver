import cv2
import numpy as np
import sys, time, logging
import base64

# ### self defined class
from carViewLibV2 import runWithFPS
from carViewLibV2 import landMark, traceMark
from carViewLibV2 import CarView, landShift
### self defined class
# from carViewLib import runWithFPS
# from carViewLib import landMark, traceMark
# from carViewLib import CarView, landShift
# logging.basicConfig(level=logging.DEBUG)
# logging.basicConfig(level=logging.ERROR)

def main():
    fps = runWithFPS()
    traceMarkL = traceMark()
    traceMarkR = traceMark()
    landShiftObj = landShift()
    carView = CarView()
    num = 0
    DEFAULT_VIDEO_SIZE = (852,480)
    while num !="-1": # set num = -1 to end this script
        fps.start()
        lines = input() ### This's for multiple input from node
        # lines = [line.rstrip() for line in lines]
        # lines = ''.join(lines)
        lineL = lines.split(",")
        num = lineL[0]
        lines = lineL[1]
        # lines = lines.encode('utf-8')
        lines = base64.b64decode(lines)
        lines = np.frombuffer(lines, dtype="uint8").reshape(-1,1)
        # # reconstruct image as an numpy array
        frame = cv2.imdecode(lines, cv2.IMREAD_UNCHANGED)
        # fps.deltaTime("reading process")
        frame = cv2.resize(frame, DEFAULT_VIDEO_SIZE)
        ### analysis frame and do face recognition
        debugFrame = carView.process(frame, traceMarkL, traceMarkR, landShiftObj, fps, debugMode=False)
        # fps.deltaTime("carView process")
        ### get velocity land shift and send out
        shiftVel = landShiftObj.getVelocity()
        velL = traceMarkL.getMedVelocity()
        velR = traceMarkR.getMedVelocity()
        if velL==0:
            velAve = velR
        elif velR == 0:
            velAve = velL
        else:
            velAve = (velL+velR)/2
        landPts = landShiftObj.getUnwarpPts()
        outMsg = f'"inputID":{num}, "landShift": "{shiftVel:.1f}", "velocity": "{velAve:.1f}"'
        outMsg += f', "landPts":"{landPts}"'
        outMsg = "{"+outMsg+"}"
        # outMsg = {'code':num, 'image':frame, 'landShift': shiftVel, 'velocity': (velL+velR)/2}
        print(outMsg)
        # k = cv2.waitKey(1)
        # if k == 27 or k == ord('q'):
        #     break
        # cv2.imshow("debug", debugFrame)
        # if int(num) >50:
            # break
        # cv2.imwrite(f"./carView/saveImg/debug{num}.jpg", debugFrame)
        fps.deltaTime(f"carView end {num}: ")
if __name__=="__main__":
    main()