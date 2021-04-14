const FRAME_TIME = 100;
const HIGH_RISK_COLOR = ['red', 'pink'];
const LOW_RISK_COLOR = ['green', 'lightgreen'];
const RISK_TOLERANCE = 60;
class RiskPlot  {
    constructor() {
        this.board = document.createElement('div');
        // this.boardOut = document.createElement('div');
        this.canvas = document.createElement('canvas');
        this.boardText = document.createElement('p');
        this.timeSlice = 0;
    }
    setBoard(inScore,text , reSize=50) {
        var outColor, inColor;
        if (parseInt(inScore) >= RISK_TOLERANCE) {
            outColor = HIGH_RISK_COLOR[1];
            inColor = HIGH_RISK_COLOR[0];
        } else {
            outColor = LOW_RISK_COLOR[1];
            inColor = LOW_RISK_COLOR[0];
        }
        this.circleProperty = {
            color:outColor, colorIn:inColor, x: 50,y: 50,radius: 40,w: 10
        };
        this.canvas.width = 100;
        this.canvas.height = 100;
        this.scaleRate = reSize / 100;
        // this.canvas.style.border = '1px solid gray';
        this.canvas.style.left = '0px';
        this.canvas.style.top = '0px';
        this.canvas.style.position = 'absolute';
        this.context = this.canvas.getContext("2d");
        // this.canvas.style.display = 'none';
        this.canvas.style.display = 'block';
        this.boardText.style.position = 'absolute';
        this.setElementPosSize(this.boardText,{top:8, left:10});
        this.boardText.style.backgroundColor = 'rgba(53, 171, 218,0)';
        this.boardText.style.fontSize = '0.8rem';
        this.boardText.style.color = outColor;
        this.boardText.innerText = text;
        this.setElementPosSize(this.board,{top:-13, left:0});
        this.board.style.position = 'relative';
        this.board.appendChild(this.canvas);
        this.board.appendChild(this.boardText);
        // this.setElementPosSize(this.boardOut,{top:0, left:0, width: "100%", height: "100%"});
        // this.boardOut.style.position = 'fixed';
        // this.boardOut.style.backgroundColor = "rgba(0,0,0,0.4)";
        // this.boardOut.style.display = "none";
        // this.boardOut.appendChild(this.board);
        // document.body.appendChild(this.board);
        this.drawCircleEdge(this.circleProperty, this.scaleRate, inScore);
    }
    drawCircleEdge (property, scaleRate=1, timeSlot) {
        var dt = (timeSlot != undefined)? timeSlot : 0;
        var ctx = this.context;
        ctx.save();
        ctx.strokeStyle = property.color;
        ctx.lineWidth = property.w;
        ctx.beginPath();
        ctx.scale(scaleRate, scaleRate);
        ctx.translate(property.x, property.y);
        ctx.arc(0, 0, property.radius, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
        // rounding part
        ctx.save();
        ctx.strokeStyle = property.colorIn;
        ctx.shadowColor = property.colorIn;
        ctx.shadowBlur = property.w/2;
        ctx.lineWidth = property.w;
        ctx.beginPath();
        ctx.scale(scaleRate, scaleRate);
        ctx.translate(property.x, property.y);
        ctx.arc(0, 0, property.radius, Math.PI, Math.PI*(1.0+dt/100));
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
    startCountDown (num, callback) {
        var self = this;
        this.boardOut.style.display = "block";
        self.boardText.innerText = num;
        self.interval = setInterval(function() {
            self.refresh(callback);
        } , FRAME_TIME);
    }
    refresh(callback) {
        var countDown = this;
        countDown.clearDraw();
        var delta = FRAME_TIME/1000;
        var tmpTime = Math.round(countDown.timeSlice*10)/10;
        if (tmpTime<0.9) {
            this.timeSlice += delta;
        } else {
            countDown.timeSlice = 0;
            var num = parseInt(countDown.boardText.innerText);
            num = num -1;
            if (num == 0) { 
                countDown.stop(); 
                callback();
            }
            countDown.boardText.innerText = num;
        }
        // console.log(tmpTime);
        countDown.drawCircleEdge(countDown.circleProperty, countDown.scaleRate, countDown.timeSlice);
    }
    stop() {
        clearInterval(this.interval);
        this.boardOut.style.display = 'none';
    }
    clearDraw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    setElementPosSize(element,posSize) {
        element.style.top = posSize.top+'px';
        element.style.left = posSize.left+'px';
        if (posSize.width!=undefined) {
            element.style.width = (typeof posSize.width == 'string')? posSize.width: posSize.width+'px';
        }
        if (posSize.height!=undefined) 
            element.style.height = (typeof posSize.height == 'string')? posSize.height: posSize.height+'px';
    }
};
export default RiskPlot;