import statistics
import numpy as np
import logging
# ### self defined class
from carViewLibV2 import runWithFPS

class landMark():
    def __init__(self, id):
        self.markPosXList = []
        self.markPosYList = []
        self.frameTimeList = []
        self.id = id
    def addPos(self, pos, frameTime = 1.0/30.0):
        self.markPosXList.append(pos['x'])
        self.markPosYList.append(pos['y'])
        self.frameTimeList.append(frameTime)
    def getLastPos(self):
        try:
            rX, rY = self.markPosXList[-1],self.markPosYList[-1]
        except:
            rX, rY = None, None
        return rX, rY
    def isVaildMark(self):
        if len(self.frameTimeList)>=5:
            return True
        else:
            return False
    def getVelocity(self):
        ### call this function when mark left view
        # DISTANCE_FACTOR = 80.0 ### carView04.mp4
        # DISTANCE_FACTOR = 30.0 ### outside3.mp4
        DISTANCE_FACTOR = 60.0 ### testDistance3.mp4
        totalT = sum(self.frameTimeList)
        velcity = DISTANCE_FACTOR / totalT
        return velcity
    def isInPosList(self, markPosYList, ft):
        DISTANCE_MARK = 25
        mx, my = self.getLastPos()
        for i, posY in enumerate(markPosYList):
            if my-2 <= posY and my+DISTANCE_MARK > posY:
                pos = {"x": 0, "y": posY}
                self.addPos(pos, frameTime = ft)
                markPosYList.pop(i)
                # print("markPosYList pop.")
                return True
        return False
class traceMark():
    # DISTANCE_MARK = 15
    def __init__(self):
        self.count = 0
        self.markList = []
        self.markIdList = []
        self.velocityList = []
    def addMark(self, pos, ft):
        mark = landMark(self.count)
        mark.addPos(pos, frameTime=ft)
        self.markList.append(mark)
        self.markIdList.append(self.count)
        self.count += 1
    def getMedVelocity(self):
        if len(self.velocityList)>5:
            self.velocityList = self.velocityList[-5:]
            vStd = statistics.stdev(self.velocityList)
            mean = statistics.mean(self.velocityList)
            self.velocityList = [v for v in self.velocityList if v > mean-(4*vStd) and v < mean+(4*vStd)]
            vel = statistics.median(self.velocityList)
            return vel
        elif len(self.velocityList)>0:
            return statistics.mean(self.velocityList)
        else: 
            return 0
    def processMark(self, maxLocation, fps = 1.0/30.0):
        DISTANCE_MARK = 20
        # array1D = maxLocation[int(len(maxLocation)/2):] ### take only bottom half
        array1D = maxLocation[int(len(maxLocation)/2)-50:-50] ### take only bottom half
        xArray = np.array(range(len(array1D)))
        zeroIdx = [i for i in range(len(array1D)) if array1D[i] == 0]
        yArrayTrim = [array1D[i] for i in range(len(array1D)) if i not in zeroIdx]
        xArrayTrim = [xArray[i] for i in range(len(xArray)) if i not in zeroIdx]
        markPosYList = []
        tmpPosYList = []
        currentIdx = -1
        for i in range(len(xArrayTrim)):
            currentY = xArrayTrim[i]
            if currentIdx < 0:
                markPosYList.append(currentY)
                tmpPosYList.append(currentY)
                currentIdx += 1
            elif currentIdx >=0 and tmpPosYList[currentIdx] > currentY -2:
                tmpPosYList[currentIdx] = currentY
            elif currentIdx >=0 and markPosYList[currentIdx] < currentY -DISTANCE_MARK:
                markPosYList.append(currentY)
                tmpPosYList.append(currentY)
                currentIdx += 1
        # print("markPosYList:",markPosYList)
        if len(markPosYList) > 0 and markPosYList[0] == 0:
            markPosYList.pop(0) ### remove 0 from list
        newList = []
        ft = fps if type(fps)==type(0.1) else fps.getTime()
        for mark in self.markList:
            logging.debug((f"marklsit len: {len(self.markList)}, markpos: {mark.markPosYList}, {mark.frameTimeList}"))
            if mark.isInPosList(markPosYList, ft) :
                newList.append(mark)
            elif mark.isVaildMark():
                vel = mark.getVelocity()
                if vel <200:
                    self.velocityList.append(vel)
                    vel = self.getMedVelocity()
                    logging.debug((f"velocity: {vel:.1f}, len: {len(self.velocityList)}"))
                    # print(f"velocity: {vel:.1f}")
            else:
                logging.debug("Invalid mark.")
        self.markList = newList
        for posY in markPosYList:
            # print("Mark added")
            pos = {"x": 0, "y": posY}
            self.addMark(pos, ft)
        
        # print("self.markList",len(self.markList))
