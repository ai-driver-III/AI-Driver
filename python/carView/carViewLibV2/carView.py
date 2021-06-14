from .traceMark import landMark, traceMark
import cv2
import numpy as np
import pandas as pd
import sys, time, logging, math

# logging.basicConfig(level=logging.ERROR)

class CarView():
    DISTANCE_FACTOR = 50
    def __init__(self):
        polyshape1 = [ [350, 150], [-100, 300], 
            [1000, 300], [450, 150]] ### for carView0#.mp4
        polyshape2 = [ [360, 280], [-174, 450],
            [1026, 450], [492, 280]] ### for outsize3.mp4  #852/2=426
        polyshape3 = [ [210, 230], [-100, 460],
            [900, 460], [590, 230]] ### for car_detect#.mp4
        polyshape4 = [ [360, 250], [-284, 400],  #-30
            [1106, 400], [462, 250]] ### for outsize4.mp4 & testDistance.mp4 #852/2=426
        polyshape5 = [ [360, 310], [-174, 480],
            [1026, 480], [492, 310]] ### for outsize2.mp4 #852/2=426
        polyshape6 = [ [410, 280], [-174, 480],
            [1026, 480], [522, 280]] ### for testDistance2.mp4 #852/2=426
        polyshape7 = [ [426-30, 190], [426-526, 460],
            [426+526, 460], [426+50, 190]] ### for testDistance3.mp4 #852/2=426
        polyshape8 = [ [426-100, 190], [426-726, 480],
            [426+726, 480], [426+120, 190]] ### for realCarView2.mov #852/2=426
        white_hsv_low1  = np.array([  18,  0,   210])
        white_hsv_low2  = np.array([  10,  0,   130])
        white_hsv_low3  = np.array([  10,  0,   170]) ### for testDistance3.mp4 #852/2=426 
        white_hsv_low4  = np.array([  10,  0,   240]) ### for realCarView_01.mp4 #852/2=426 
        self.landShape = polyshape8
        self.white_hsv_low_now = white_hsv_low4
        self.birdViewShape = [ [0, 0], [0, 480], [400, 480], [400, 0]	]

    def getBirdEyeView(self, frame, plotFlag = False):
        # # cv2.imwrite(f"./saveImg/orgView{1}.jpg", frame)
        # print("frame size:", frame.shape) ## 852,480
        # rect = np.array(polyshape1, dtype = "float32")
        self.height = frame.shape[0]
        self.width = frame.shape[1]
        rect = np.array(self.landShape, dtype = "float32")
        # map the screen to a top-down, "birds eye" view
        dst = np.array(self.birdViewShape, dtype = "float32")
        # calculate the perspective transform matrix and warp
        # the perspective to grab the screen
        M = cv2.getPerspectiveTransform(rect, dst)
        warp = cv2.warpPerspective(frame, M, (400, 480))
        warp = cv2.resize(warp, (400, 200), interpolation=cv2.INTER_AREA)
        # print("warp.shape", warp.shape)
        if plotFlag:
            cv2.imwrite(f"./saveImg/birdView{1}.jpg", warp)
        return warp
    def upwarpView(self, frame, plotFlag= False):
        frame = cv2.resize(frame, (400, 480), interpolation=cv2.INTER_AREA)
        if plotFlag:
            cv2.imwrite(f"./saveImg/unwarp{1}.jpg", frame)
        rect = np.array(self.landShape, dtype = "float32")
        # map the screen to a top-down, "birds eye" view
        dst = np.array(self.birdViewShape, dtype = "float32")
        # calculate the perspective transform matrix and warp
        # the perspective to grab the screen
        M = cv2.getPerspectiveTransform(dst, rect)
        warp = cv2.warpPerspective(frame, M, (self.width, self.height))
        return warp
    def modify_lightness_saturation(self, img, plotFlag = False):
        # 圖像歸一化，且轉換為浮點型
        fImg = img.astype(np.float32)
        fImg = fImg / 255.0
        # 顏色空間轉換 BGR -> HLS
        hlsImg = cv2.cvtColor(fImg, cv2.COLOR_BGR2HLS)
        hlsCopy = np.copy(hlsImg)
        lightness = 0 # lightness 調整為  "1 +/- 幾 %"
        saturation = 300 # saturation 調整為 "1 +/- 幾 %"
        # 亮度調整
        hlsCopy[:, :, 1] = (1 + lightness / 100.0) * hlsCopy[:, :, 1]
        hlsCopy[:, :, 1][hlsCopy[:, :, 1] > 1] = 1  # 應該要介於 0~1，計算出來超過1 = 1
        # 飽和度調整
        hlsCopy[:, :, 2] = (1 + saturation / 300.0) * hlsCopy[:, :, 2]
        hlsCopy[:, :, 2][hlsCopy[:, :, 2] > 1] = 1  # 應該要介於 0~1，計算出來超過1 = 1
        # 顏色空間反轉換 HLS -> BGR 
        result_img = cv2.cvtColor(hlsCopy, cv2.COLOR_HLS2BGR)
        result_img = ((result_img * 255).astype(np.uint8))
        if plotFlag:
            cv2.imwrite(f"./saveImg/bV_mls{1}.jpg", result_img)
        return result_img
    # def applyCustomMask(self, frame):
    #     land_low = np.array([0, 0, 136])
    #     land_high = np.array([180, 255, 255])
    #     white_low = np.array([0, 0, 0])
    #     white_high = np.array([180, 255, 173])

    def applyAveMask(self, frame):
        frame = cv2.GaussianBlur(frame, (9, 9), 0) # 數字愈大愈模糊 去雜訊用
        hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
        ratio = 2.5
        hsvOrg = hsv.copy()
        hsv = np.reshape(hsv, (-1,3))
        ### plot histogram
        # df = pd.DataFrame(hsv)
        # df.plot.hist()
        # plt.show()
        hsvCol = []
        for i in range(hsv.shape[1]):
            hsvCol.append(hsv[:,i])
        mean = [np.mean(hsvCol[i])  for i in range(hsv.shape[1])]
        std = [np.std(hsvCol[i]) for i in range(hsv.shape[1])]
        # print(mean, std)
        minHSV = np.array([int(max(0,mean[i]-ratio*std[i])) for i in range(hsv.shape[1])])
        # minHSV = np.array([0, 0, 0])
        maxHSV = np.array([int(min(255,mean[i]+ratio*std[i])) for i in range(hsv.shape[1])])
        # print("hsv_low, hsv_high", minHSV, maxHSV)
        maskAuto = cv2.inRange(hsvOrg, minHSV, maxHSV)
        maskAuto = cv2.bitwise_not(maskAuto)
        # diff = cv2.erode(maskAuto, None, iterations=5) # erode侵蝕 細小點會消失 預設是3x3大小
        # maskAuto = cv2.dilate(diff, None, iterations=5) # dilate膨脹 復原回來
        # maskAuto = cv2.Canny(maskAuto, 30, 150) # edge detect
        return maskAuto
    def applyColorMask(self, frame, plotFlag = False):
        # frame = cv2.GaussianBlur(frame, (11, 11), 0) # 數字愈大愈模糊 去雜訊用
        hsv = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
        yellow_hsv_low  = np.array([ 0, 100, 100]) ## 180 11 70
        # yellow_hsv_low  = np.array([ 0, 80, 200])
        yellow_hsv_high = np.array([ 40, 255, 255])
        maskY = cv2.inRange(hsv, yellow_hsv_low, yellow_hsv_high)
        white_hsv_low  = self.white_hsv_low_now
        white_hsv_high = np.array([ 255,  80, 255])
        maskW = cv2.inRange(hsv, white_hsv_low, white_hsv_high)
        # res = cv2.bitwise_and(img,img, mask= mask)
        mask = maskY+maskW
        # diff = cv2.erode(mask, None, iterations=2) # erode侵蝕 細小點會消失 預設是3x3大小
        mask = cv2.dilate(mask, None, iterations=2) # dilate膨脹 復原回來
        if plotFlag:    
            cv2.imwrite(f"./saveImg/applyColorV{2}.jpg", mask)
        return mask
    def abs_sobel_thresh(self, img, orient='x', thresh_min=0, thresh_max=255, plotFlag = False):
        # Apply the following steps to img
        # 0) to HSL
        imgHLS = cv2.cvtColor(img, cv2.COLOR_BGR2HLS)
        Lchannel = imgHLS[:,:,1]
        maskL = cv2.inRange(Lchannel, 195, 255)
        Schannel = imgHLS[:,:,2]
        maskS = cv2.inRange(Schannel, 120, 255)
        gray = maskL + maskS
        # 1) Convert to grayscale
        # gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # 2) Take the derivative in x or y given orient = 'x' or 'y'
        if orient == 'x':
            sobel = cv2.Sobel(gray, cv2.CV_64F, 1, 0)
        if orient == 'y':
            sobel = cv2.Sobel(gray, cv2.CV_64F, 0, 1)
        # 3) Take the absolute value of the derivative or gradient
        abs_sobel = np.absolute(sobel)
        # 4) Scale to 8-bit (0 - 255) then convert to type = np.uint8
        scaled_sobel = np.uint8(255*abs_sobel/np.max(abs_sobel))
        if plotFlag:
            cv2.imwrite(f"./saveImg/sobel{1}.jpg", scaled_sobel)
        return scaled_sobel 
        # 5) Create a mask of 1's where the scaled gradient magnitude
                # is > thresh_min and < thresh_max
        # binary_output = np.zeros_like(scaled_sobel)
        # binary_output[(scaled_sobel >= thresh_min) & (scaled_sobel <= thresh_max)] = 1
        # 6) Return this mask as your binary_output image
        # return binary_output 
    def firstLandDetect(self, colArray, landShift, threshold = 0.05):
        storeX = []
        storeIntensity = []
        storeCount = []
        cIndex = -1
        centerX = len(colArray)/2
        for i in range(len(colArray)-1):
            if colArray[i]<threshold and colArray[i+1]>=threshold:
                cIndex += 1
                storeX.append(0)
                storeIntensity.append(0)
                storeCount.append(0)
            elif i == 0 and colArray[i]>=threshold:
                cIndex += 1
                storeX.append(i)
                storeIntensity.append(colArray[i])
                storeCount.append(1)
            elif colArray[i]>=threshold:
                storeX[cIndex] += i
                storeIntensity[cIndex] += colArray[i]
                storeCount[cIndex] += 1
        storeCount = np.array(storeCount)
        storeX = np.array(storeX) / storeCount
        storeIntensity = np.array(storeIntensity) / storeCount
        # print("storeX: ",storeX)
        # print("storeIntensity: ",storeIntensity)
        leftX = [storeIntensity[i] for i in range(len(storeX)) if storeX[i] < centerX]
        # leftXIndex = storeIntensity.index(max(leftX))
        if len(leftX) == 0:
            leftXIndex = returnL = None
        else:
            leftXIndex = np.where(storeIntensity == max(leftX))
            returnL = int(storeX[leftXIndex[0][0]])
        rightX = [storeIntensity[i] for i in range(len(storeX)) if storeX[i] > centerX]
        # rightXIndex = storeIntensity.index(rightX[0])
        if len(rightX) == 0:
            rightXIndex = returnR = None
        else:
            rightXIndex = np.where(storeIntensity == rightX[0])
            returnR = int(storeX[rightXIndex[0][0]])
        if returnL!=None and returnR!=None and returnL!=returnR:
            landWidth = 3.5 #unit meter
            averageRL = (returnR + returnL)/2.0
            offsetMeter = abs((centerX - averageRL) * landWidth / (returnR - returnL))
            if landShift!= None:
                landShift.addPos(offsetMeter)
            # print(f"offsetMeter: {offsetMeter:.2f}")
        return returnL, returnR

    def getMaxLocation(self, frame, positionX, i=0):
        windowX = 100
        offsetX = max(0,positionX-int(windowX/2))
        leftFrame = frame[:, offsetX:positionX+int(windowX/2)]
        if i != 0:
            cv2.imwrite(f"./saveImg/leftFrame{i}.jpg", leftFrame)
        maxLocation = []
        for row in leftFrame:
            tmpMax = max(row)
            if tmpMax == 0:
                idx = np.where(row == 0)
                maxLocation.append(int(idx[0][0]))
            else :
                idx = np.where(row == tmpMax)
                # maxLocation.append(int(idx[0][0]+offsetX))
                maxLocation.append(int(idx[-1][-1]+offsetX))
        return maxLocation
    def calPolyfitX(self, array1D):
        xArray = np.array(range(len(array1D)))
        zeroIdx = [i for i in range(len(array1D)) if array1D[i] == 0]
        yArrayTrim = [array1D[i] for i in range(len(array1D)) if i not in zeroIdx]
        xArrayTrim = [xArray[i] for i in range(len(xArray)) if i not in zeroIdx]
        if len(yArrayTrim)>3:
            coef = np.polyfit(xArrayTrim, yArrayTrim, 2)
            p = np.poly1d(coef)
            pred_y = p(xArray)
        else: 
            pred_y = None
        return pred_y
        
    def secondLandDetect(self, frame, leftX, rightX, traceMarkL=None, traceMarkR=None, fps = 1/30, i=0):
        if leftX != None:
            maxLocation = self.getMaxLocation(frame, leftX, i)
            if traceMarkL==None:
                traceMarkL = traceMark()
            traceMarkL.processMark(maxLocation, fps)
            fitLocationL = self.calPolyfitX(maxLocation)
        else:
            fitLocationL = None
        if rightX != None:
            maxLocation = self.getMaxLocation(frame, rightX)
            if traceMarkR==None:
                traceMarkR = traceMark()
            traceMarkR.processMark(maxLocation, fps)
            fitLocationR = self.calPolyfitX(maxLocation)
        else:
            fitLocationR = None
        return fitLocationL, fitLocationR
    def drawFitLand(self, frame, fitLocationL, fitLocationR, lengthWidth = 3, debugMode=False):
        frame = np.float32(frame)
        color = (0,0,255) ###BGR
        centerColor = (0,100,0)
        try:
            fitLocationL = list(fitLocationL)
            fitLocationR = list(fitLocationR)
        except:
            pass
        ### draw edge line
        # for i, row in enumerate(frame):
        #     for j in range(len(row)):
        #         if (fitLocationL!=None and j == fitLocationL[i]):
        #             row[j] = color
        #         elif (fitLocationR!=None and j == fitLocationR[i]):
        #             row[j] = color
        #         elif ((fitLocationL!=None) and (fitLocationR!=None) and (j>fitLocationL[i]) and (j < fitLocationR[i])):
        #             row[j] = centerColor
        newPts = []
        if fitLocationL!= None and fitLocationR!=None:
            RPts = []
            for i in range(0,len(fitLocationL),10):
                newPts.append([fitLocationL[i],i])
            for i in range(0,len(fitLocationR),10):
                RPts.append([fitLocationR[i],i])
            RPts.reverse()
            newPts.extend(RPts)
            newPts = np.array(newPts, dtype = np.int32)
            if debugMode:
                area = cv2.contourArea(newPts)
                logging.debug("Area: "+str(area))
                # print("Area: "+str(cv2.contourArea(newPts)))
                # cv2.fillPoly(frame, [newPts], centerColor)
                # if area>33000 and area< 38000:
                if area>35000 and area< 43000:
                    cv2.fillPoly(frame, [newPts], centerColor)
        return frame, newPts
    def landDetect(self, frame, plotFlag = False, fps=1/30, traceMarkL=None, traceMarkR=None, landShift = None):
        df = pd.DataFrame(frame)
        colmean = (df.mean(axis=0)) / df.shape[1]
        leftX, rightX = self.firstLandDetect(colmean, landShift)
        # logging.debug("first land detect:"+str(leftX))
        # logging.debug("first land detect:"+str(rightX))
        return self.secondLandDetect(frame, leftX, rightX, traceMarkL=traceMarkL, traceMarkR=traceMarkR, fps=fps)
    def combineUnwarp(self, frame, unwarp, method="weighted"):
        unwarp = unwarp.astype(np.uint8)  ### very important step
        if method == "bitwise":
            gray = cv2.cvtColor(unwarp,cv2.COLOR_BGR2GRAY)
            ret, ma1 = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV)
            ma1 = ma1.astype(np.uint8)  ### very important step
            fg1 = cv2.bitwise_and(frame,frame,mask=ma1)
            frame = cv2.add(fg1, unwarp)
        elif method == "weighted":
            frame = cv2.addWeighted(frame, 1, unwarp, 0.4, 0)
        return frame
    def unwarpPts(self, newPts, reverse=False):
        if not reverse:
            rect = np.array(self.landShape, dtype = "float32")
            dst = np.array(self.birdViewShape, dtype = "float32")
            resizeY=480/200
            returnPts = []
            for point in newPts:
                YdRatio = ( point[1]*resizeY - dst[0][1] ) / (dst[1][1] - dst[0][1])
                Yt =  YdRatio * (rect[1][1] - rect[0][1]) + rect[0][1]
                XdRatio = ( point[0] - dst[0][0] ) / (dst[2][0] - dst[0][0])
                XtRange = (rect[2][0] - rect[1][0] - rect[3][0] + rect[0][0])
                tSlope = (rect[1][0] - rect[0][0]) / (rect[1][1] - rect[0][1])
                Xt = XdRatio * (YdRatio*XtRange + rect[3][0] - rect[0][0]) + (Yt-rect[0][1]) * tSlope + rect[0][0]
                returnPts.append([int(Xt), int(Yt)])
        # self.landShape = [ [360, 280], [-400, 430],   
        #     [1000, 430], [480, 280]]
        # self.birdViewShape = [ [0, 0], [0, 480], [400, 480], [400, 0]	]
        else:
            dst = np.array(self.landShape, dtype = "float32")
            rect = np.array(self.birdViewShape, dtype = "float32")
            resizeY=1
            returnPts = []
            for point in newPts:
                ### y linear methon
                YdRatioLinear = ( point[1]*resizeY - dst[0][1] ) / (dst[1][1] - dst[0][1])
                ### y exponential method
                base = 2
                startY = point[1]*resizeY - dst[0][1] ## prevent error
                startY = 0 if startY < 0 else startY ## prevent error
                YdRatio = math.log(startY+1, base) / math.log(dst[1][1] - dst[0][1]+1, base)
                ###
                Yt =  YdRatio * (rect[1][1] - rect[0][1]) + rect[0][1]
                Xoffset = (dst[1][0]-dst[0][0])*YdRatioLinear + dst[0][0]
                Xratio = (dst[2][0]-dst[1][0]-dst[3][0]+dst[0][0])*YdRatioLinear + (dst[3][0]-dst[0][0])
                Xt = (point[0]- Xoffset) * (rect[2][0]-rect[0][0]) / Xratio
                returnPts.append([int(Xt), int(Yt)])
        ### plot for debug ###
        # import matplotlib.pyplot as plt
        # plt.plot(newPts[:,0],newPts[:,1])
        # returnPts = np.array(returnPts)
        # plt.plot(returnPts[:,0],returnPts[:,1])
        # plt.savefig("./saveImg/land.png")
        # plt.clf()
        return returnPts
    def filterOutsidePts(self, points):
        leftLimit = 100
        rightLimit = 300
        topLimit = 0
        newPts = []
        for point in points:
            if point[0]>leftLimit and point[0] < rightLimit and point[1]>topLimit:
                newPts.append(point)
            else:
                newPts.append([])
        return newPts
    def getObjDistance(self, points):
        distList = []
        maxPixelY = self.birdViewShape[1][1]
        warpPoints = self.unwarpPts(points, reverse=True)
        warpPoints = self.filterOutsidePts(warpPoints)
        for point in warpPoints:
            # logging.debug(points,warpPoints)
            if len(point)>0:
                dist = int((maxPixelY-point[1]) * self.DISTANCE_FACTOR / maxPixelY)
                distList.append(dist)
            else:
                distList.append(-1)
            # distList.append(point[1]) ### for debug
        return distList, warpPoints
    def processObjPos(self, acm, warpPoints):
        debug = cv2.cvtColor(acm ,cv2.COLOR_GRAY2BGR)
        debug = cv2.resize(debug, (400, 480), interpolation=cv2.INTER_AREA)
        if warpPoints != None:
            for point in warpPoints:
                if len(point)>0:
                    # print("object:",point[0],point[1])
                    cv2.circle(debug, (point[0],point[1]),5,(255,0,0),-1)
        debug = cv2.resize(debug, (400, 200), interpolation=cv2.INTER_AREA)
        return debug
    def process(self, frame, traceMarkL, traceMarkR, landShift, fps, debugMode=False):
        warp = self.getBirdEyeView(frame)
        # warp = modify_lightness_saturation(warp) ### not work
        acm = self.applyColorMask(warp, plotFlag=False)
        sobel = self.abs_sobel_thresh(warp)
        fitLocationL, fitLocationR = self.landDetect(acm, 
            traceMarkL=traceMarkL, traceMarkR=traceMarkR, landShift=landShift, fps = fps)
        zeroWrap = np.zeros((warp.shape[0], warp.shape[1], 3))
        warpWLand, landPts = self.drawFitLand(zeroWrap, fitLocationL, fitLocationR, debugMode=debugMode)
        # logging.debug("landPts",landPts)
        unwarpLandPts = self.unwarpPts(landPts)
        # logging.debug("unwarpLandPts",unwarpLandPts)
        landShift.addUnwarpPts(unwarpLandPts)
        ### debug code ###
        if debugMode:
            unwarp = self.upwarpView(warpWLand)
            frame = self.combineUnwarp(frame, unwarp)
            maskAuto = self.applyAveMask(warp)
            maskAuto = cv2.cvtColor(maskAuto,cv2.COLOR_GRAY2BGR)
            # debug = np.float32(debug)
            warp = np.uint8(warp)
            # frame = np.float32(frame)
            frame = cv2.resize(frame, (400,200))
            # print("frame", frame.shape, frame.dtype)
            # print("debug", debug.shape, debug.dtype)
            # print("warp ", warp.shape, warp.dtype)
            # print("maskAuto ", maskAuto.shape, maskAuto.dtype)
            # debugFrame = warp
            debugFrame = cv2.vconcat([frame,warp])
            return debugFrame, acm
        return 0,0