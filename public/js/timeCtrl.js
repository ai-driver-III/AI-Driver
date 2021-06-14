const UNIT_TIME = 1000;
class TimeControl  {
    constructor(time, percent, tol, reverse) {
        this.timeKeep = time*UNIT_TIME;
        this.RISK_TOLERANCE = tol;
        this.riskPercent = percent;
        this.timeList = [];
        this.scoreList = [];
        this.currentTime = undefined;
        this.MAX = 100;
        this.reverse = false;
        if (reverse!=undefined) {
            this.reverse = reverse;
        }
        if (this.reverse)
            this.RISK_TOLERANCE = this.MAX - this.RISK_TOLERANCE;
    }
    addScore (score) {
        if (this.currentTime==undefined) {
            this.currentTime = new Date().getTime();
        } else {
            if (this.reverse) {
                score = this.MAX - score;
            }
            var tmpTime = new Date().getTime();
            this.timeList.push(tmpTime-this.currentTime);
            this.currentTime = tmpTime;
            this.scoreList.push(score);
        }
    }
    filterByTime() {
        var sumTime = this.timeList.reduce((a, b) => a + b, 0);
        var flag = false;
        while (sumTime>this.timeKeep) {
            // console.log("timeCtrl:", this.timeList.length, sumTime);
            this.timeList.shift();
            this.scoreList.shift();
            sumTime = this.timeList.reduce((a, b) => a + b, 0);
            flag = true;
        }
    }
    judgeRisk () {
        this.filterByTime();
        var tmpCount = 0;
        for (var i=0;i<this.scoreList.length;i++) {
            if (this.scoreList[i]>this.RISK_TOLERANCE)
                tmpCount ++;
        }
        if ((tmpCount/this.scoreList.length)>this.riskPercent) {
            return true;
        } else {
            return false;
        }
    }
    judgeSendDB () {
        var tmpTime = new Date().getTime();
        if (this.previousSend==undefined) {
            console.log("previous undefined");
            this.previousSend = tmpTime;
            return false
        } else if ((tmpTime - this.previousSend) > this.timeKeep) {
            this.previousSend = tmpTime;
            return true
        } else {
            console.log("delta time",(tmpTime - this.previousSend))
            return false
        }
    }
    collectData () {
        this.filterByTime();
        var sumScore = this.scoreList.reduce((a, b) => a + b, 0);
        var aveScore = sumScore/ this.scoreList.length;
        var tmpCount = 0;
        for (var i=0;i<this.scoreList.length;i++) {
            if (this.scoreList[i]>this.RISK_TOLERANCE)
                tmpCount ++;
        }
        var data = {
            time: new Date().getTime(),
            fatigueAve: aveScore,
            fatigueCount: tmpCount
        }
        return data;
    }
};
export default TimeControl;