
class landShift():
    def __init__(self):
        self.shiftList = []
        self.unwarpPts = []
    def addPos(self, shift):
        self.shiftList.append(shift)
        if len(self.shiftList)>10:
            self.shiftList = self.shiftList[1:]
    def getVelocity(self):
        if len(self.shiftList):
            totalT = sum(self.shiftList)
            aveShift = totalT / len(self.shiftList)
            return aveShift
        else:
            return 0
    def addUnwarpPts(self, pts):
        self.unwarpPts = pts
    def getUnwarpPts(self):
        return self.unwarpPts