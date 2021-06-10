import cv2
import numpy as np
import multiprocessing as mp

class Yoylv4Tiny():
    def __init__(self):
        CONFIG = 'python/carView/yolo4tiny/yolov4-tiny.cfg'
        WEIGHT = 'python/carView/yolo4tiny/yolov4-tiny.weights'
        NAMES = 'python/carView/yolo4tiny/coco.names'

        # 讀取物件名稱以及設定外框顏色
        with open(NAMES, 'r') as f:
            names = [line.strip() for line in f.readlines()]
            colors = np.random.uniform(0, 255, size=(len(names), 3))

        # 設定神經網路
        net = cv2.dnn.readNet(CONFIG, WEIGHT)
        model = cv2.dnn_DetectionModel(net)
        model.setInputParams(size=(416, 416), scale=1/255.0)
        # YOLO 要對調顏色
        model.setInputSwapRB(True)
        self.model = model
        self.names = names
        self.colors = colors
        # return model, names, colors
        
    def nnProcess(self, image, model=None):
        if model==None:
            model = self.model
        classes, confs, boxes = model.detect(image, 0.6, 0.3)
        objPts = []
        for box in boxes:
            x, y, w , h = box 
            objPts.append([x+w/2, y+h])
        return classes, confs, boxes, objPts

    def drawBox(self, image, classes, confs, boxes, names=None, colors=None):
        if names==None:
            names = self.names
        if colors==None:
            colors = self.colors
        new_image = image.copy()
        for (classid, conf, box) in zip(classes, confs, boxes):
            x, y, w , h = box 
            label = '{}: {:.2f}'.format(names[int(classid)], float(conf))
            color = colors[int(classid)]
            cv2.rectangle(new_image, (x, y), (x + w, y + h), color, 2)
            cv2.putText(new_image, label, (x, y - 10), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2
            )
        return new_image
    def getObjectInfo(self, classes, confs, boxs, names=None):
        if names==None:
            names = self.names
        returnLabel = []
        returnBox = []
        for (classid, conf, box) in zip(classes, confs, boxs):
            x, y, w, h = box
            label = '{}#{:.2f}'.format(names[int(classid)], float(conf))
            returnLabel.append(label)
            returnBox.append([x, y, w, h])
        return returnLabel, returnBox
