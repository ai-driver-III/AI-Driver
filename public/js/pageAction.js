import RiskPlot from "./risk.js";
import TimeControl from "./timeCtrl.js";
import AudioPlay from "./audioPlay.js";
// ******** RiskPlot( threshold , maxValue) *********
var riskPlots = {fatigue: new RiskPlot(50, 100), speed: new RiskPlot(150,200),
    land: new RiskPlot(200, 300), distance: new RiskPlot(15, 100, true)}
// ******** timeControl( second for warning, percentage for warning, threshold) *********
var timeControl = {fatigue: new TimeControl(10, 0.7, 50), warning: new TimeControl(1, 0.9, 15, true)}
var audioPlay = {fatigueF: new AudioPlay('sound/fatigue_f.wav'), fatigueM: new AudioPlay('sound/fatigue_m.wav'), 
    warningF: new AudioPlay('sound/warning_f.wav'), warningM: new AudioPlay('sound/warning_m.wav')}
var dataDB = {fatigue: new TimeControl(10, 0.7, 50)};
// *******realtime start********
var storeNum = [];
var num = 0;
// *******realtime end********
// *******Video start********
var playVideo = true;
// *******Video end********
var grepVideoWidth = 400;
var canvas = document.createElement('canvas')
var carVideo = document.getElementById('videoX');
const VIDEO_DEFAULT_SIZE = { width: 852, height: 480 };
const VELOCITY_TOL = 40;
var token;
$(document).ready(function () {
    var name = localStorage.getItem("yourName");
    token = localStorage.getItem("token");
    document.getElementById("token").value = token;
    if (name==null)
        window.location.href = `./`;
    nameTag.innerText = `Hi ${name}!`;
    logoutP.onclick = logoutAction;
    try {
        // *******video start********
        console.log('video start')
        // uMovBtn.onclick = uImgBtnAction;
        var X1
        var Y1

        $("#video_strvideo").on('click', function () {
            console.log('("videoX").play()');
            playVideo = true; //暫停後再播放需設定為true,資料才會重新傳輸
            document.getElementById("videoX").play();
            // video_driver(videoX,0)         //影片的圖片資料傳回後端
            carViewSnap(0)
            try {
                document.getElementById("videoY").play();
                video_face(videoY, 0)
            } catch (error) {
                console.log(error)
            }

        })
        $("#video_stpvideo").on('click', function () {
            console.log('("videoX").pause()');
            document.getElementById("videoX").pause();
            try {
                document.getElementById("videoY").pause();
                video_face(videoY, 0)
            } catch (error) {
                console.log(error)
            }
            playVideo = false;
        })
        // *******video end********
    } catch (error) {
        console.log(error)
    }
    // *******realtime start********
    try {
        var sCamBtnEle = document.getElementById('sCamBtn');
        if (sCamBtnEle != null && sCamBtnEle.value == '')
            sCamBtnEle.onclick = sCamBtnAction;
        var aImage;
        sCamBtn.onclick = startCam;
        okButton.onclick = sendFrameInterval;
        // *******realtime end********   
    } catch (error) {
        console.log(error)
    }

});


function placeResultValue(dataObj) {
    var keys = Object.keys(dataObj);
    keys.forEach(key => {
        var score = dataObj[key].score;
        var risk = dataObj[key].risk;
        // var tmpRiskPlot = new RiskPlot();
        riskPlots[key].setBoard(score, risk);
        var tmpSEle = document.getElementById(key + 'Score');
        tmpSEle.innerText = score;
        var tmpREle = document.getElementById(key + 'Risk');
        tmpREle.appendChild(riskPlots[key].board);
    });
}
function sCamBtnAction() {
    var imgDisplayDivEle = document.getElementById('imgDisplayDiv');
    var realImgEle = document.getElementById('realImg');
    var imgInterval;
    const socket = io();
    $.ajax({
        type: "post",
        url: '/runpy',
        data: {},
        processData: false,  // This's for invocation error
        // contentType : 'image/jpg',
        contentType: false,
        // dataType: 'binary'
        enctype: "multipart/form-data"
    }).done(response => {

        setTimeout(() => { // delay 1 second
            console.log("socket start...");
            socket.on('image', (image) => {
                console.log('ready to get image:');
                realImgEle.src = `data:image/jpeg;base64,${image}`;
            });
        }, 1000);
    })
}
function serializeToJSON(data) {
    var values = {};
    for (index in data) {
        values[data[index].name] = data[index].value;
    }
    // return JSON.stringify(values)
    return values;
}

function sendFrameInterval() {
    webCamSnap(num);
    num += 1
}
function webCamSnap(runNo) {
    var beginTime = new Date().getTime();
    storeNum.push(beginTime);
    Webcam.snap(function (snappedImage) {
        console.log("snappedImage", snappedImage);
        var imageString = snappedImage.split(",")[1];
        var data = { num: runNo, time: beginTime, imageString: imageString };
        $.post("/realtime", data, function (receive) {
            realImg.src = `data:image/jpeg;base64,${receive.imageString}`;
            console.log('receive.imageString', receive.imageString)
            sendFrameInterval();
        });
    });  // End of Webcam.snap
}
function startCam() {
    // WebCam 啟動程式
    Webcam.set({
        // width: 160,
        // height: 120,
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 90,
        id: 'videoY'
    });
    Webcam.attach('#webcamDiv');
    setTimeout(function(){ 
        videoY.style.height = "150px";
        video_face(videoY, 0)
    },5000);
   
}

function video_driver(carVideo, runNo) {
    var canvas = document.createElement('canvas');
    // console.log('carVideo.width',carVideo.videoWidth,carVideo.videoHeight)
    var ratio = carVideo.videoWidth / carVideo.videoHeight; // original viedo width
    if (carVideo.width == 0)
        carVideo.width = carVideo.videoWidth;
    canvas.width = carVideo.width;//carVideo video id='videoX'
    canvas.height = carVideo.width / ratio;
    var ctx = canvas.getContext('2d');
    //draw image to canvas. scale to target dimensions
    // console.log("canvas.width, canvas.height",canvas.width, canvas.height);
    console.log(typeof carVideo)
    ctx.drawImage(carVideo, 0, 0, canvas.width, canvas.height);
    var dataURI = canvas.toDataURL('image/jpeg');
    dataURI = dataURI.split(",")[1];
    var data = { num: runNo, imageString: dataURI };
    $.post("/video_driver", data, function (receiveX) {
        console.log('receiveX', receiveX)
        if (playVideo)
            video_driver(carVideo, runNo + 1)
        console.log('video_driver')
    });
}
function video_face(faceVideo, runNo) {
    
    var canvas = document.createElement('canvas');
    // console.log('carVideo.width',carVideo.videoWidth,carVideo.videoHeight)
    var ratio = faceVideo.videoWidth / faceVideo.videoHeight; // original viedo width
    if (faceVideo.width == 0)
        faceVideo.width = faceVideo.videoWidth;
    canvas.width = grepVideoWidth*0.6;//carVideo video id='videoX'
    canvas.height = faceVideo.width / ratio;
    var ctx = canvas.getContext('2d');
    //draw image to canvas. scale to target dimensions
    // console.log("canvas.width, canvas.height",canvas.width, canvas.height);
    ctx.drawImage(faceVideo, 0, 0, canvas.width, canvas.height);
    var dataURI = canvas.toDataURL('image/jpeg');
    dataURI = dataURI.split(",")[1];
    var data = { num: runNo, imageString: dataURI, token: token };
    $.post("/video_face", data, function (receiveY) {
        var realTimeDriver_dataJson = receiveY.realTimeDriver_dataJson
        // console.log('realTimeDriver_dataJson',realTimeDriver_dataJson)
        // realImg_driver.src = 'data:image/jpeg;base64,'+realTimeDriver_dataJson.image // not work

        var landRisk = "high";
        if (parseFloat(realTimeDriver_dataJson.landShift) < 0.6) {
            landRisk = "low";
        }
        var dataObj = {speed: {score: realTimeDriver_dataJson.velocity, risk: "low"}, land: {score: parseInt(realTimeDriver_dataJson.landShift*100), risk:landRisk}};
        placeResultValue(dataObj);
        // console.log("realTimeDriver_dataJson.distList:",realTimeDriver_dataJson.distList)
        var distances = JSON.parse(realTimeDriver_dataJson.distList);
        // distances = distances.filter(item => !(item < 0));
        distances = distances.filter(item => !(item < 1));
        var minDist = Math.min.apply(Math,distances)
        timeControl.warning.addScore(minDist);
        if (timeControl.warning.judgeRisk()&&realTimeDriver_dataJson.velocity>VELOCITY_TOL)
            playAlarmAudio(1);
        var distRisk = (minDist < 10)? "high" : "low";
        dataObj = {distance: {score: minDist, risk: distRisk}};
        placeResultValue(dataObj);

        if (playVideo)
            video_face(faceVideo, runNo + 1)
        // console.log(receiveY.score)
        timeControl.fatigue.addScore(receiveY.score*100);
        if (timeControl.fatigue.judgeRisk())
            playAlarmAudio(0);
        var fatRisk = (receiveY.score<0.5)? 'low' : 'high';
        var dataObj = {fatigue: {score: parseInt(receiveY.score*100), risk: fatRisk}};
        placeResultValue(dataObj);
        // data collection db
        console.log("data collection db");
        dataDB.fatigue.addScore(receiveY.score*100);
        if (dataDB.fatigue.judgeSendDB()) {
            var dbCollectData = JSON.stringify(dataDB.fatigue.collectData());
            var dbData = {data: dbCollectData, token: token};
            console.log("to dbData:", dbData);
            $.post("/login/dbCollectData", dbData, function(receive) {
                console.log("[DB data sent]:"+ receive);
            });
        }
    });
}
function drawPolygon(thisCanvas, landPts, colorStr) {
    var ratioX = thisCanvas.width / VIDEO_DEFAULT_SIZE.width;
    var ratioY = thisCanvas.height / VIDEO_DEFAULT_SIZE.height;
    var xMax = 0, xMin = 900;
    var ctx = thisCanvas.getContext('2d');
    // fill land 
    ctx.fillStyle = `rgba(${colorStr}, 0.1)`;
    ctx.beginPath();
    ctx.moveTo(landPts[0][0] * ratioX, landPts[0][1] * ratioY);
    for (var i = 1; i < landPts.length; i++) {
        ctx.lineTo(landPts[i][0] * ratioX, landPts[i][1] * ratioY);
        if (landPts[i][0] * ratioX > xMax)
            xMax = landPts[i][0] * ratioX;
        if (landPts[i][0] * ratioX < xMin)
            xMin = landPts[i][0] * ratioX;
    }
    ctx.closePath();
    ctx.fill();
    // draw view center
    var width = thisCanvas.width;
    var height = thisCanvas.height;
    // console.log("width, height: ",width, height)
    ctx.strokeStyle = `rgba(0, 0, 255, .2)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 3 / 4);
    ctx.lineTo(width / 2, height * 3 / 4 + 25);
    ctx.moveTo(width / 2 - 15, height * 3 / 4 + 15);
    ctx.lineTo(width / 2 + 15, height * 3 / 4 + 15);
    ctx.stroke();
    // draw land center
    ctx.strokeStyle = `rgba(${colorStr}, .5)`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo((xMax + xMin) / 2, height * 3 / 4);
    ctx.lineTo((xMax + xMin) / 2, height * 3 / 4 + 25);
    ctx.stroke();
}

function getCarView(sizeWidth) {
    // console.log('carVideo.width',carVideo.videoWidth,carVideo.videoHeight)
    var ratio = carVideo.videoWidth / carVideo.videoHeight; // original viedo width
    // if (carVideo.width==0)
    carVideo.width = sizeWidth;
    canvas.width = carVideo.width;
    canvas.height = carVideo.width / ratio;
    var ctx = canvas.getContext('2d');
    //draw image to canvas. scale to target dimensions
    // console.log("canvas.width, canvas.height",canvas.width, canvas.height);
    ctx.drawImage(carVideo, 0, 0, canvas.width, canvas.height);
    var dataURI = canvas.toDataURL(`image/jpeg`);
    // displayCarImg.src = dataURI;
    // console.log("dataURI: ",dataURI); 
    return dataURI;
}
function drawLabels(thisCanvas, labels, boxes, distances) {
    var ratioX = thisCanvas.width / VIDEO_DEFAULT_SIZE.width;
    var ratioY = thisCanvas.height / VIDEO_DEFAULT_SIZE.height;
    var ctx = thisCanvas.getContext('2d');
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    for (var i=0; i < labels.length; i++) {
        // console.log("label:",labels[i], boxes[i][0]*ratioX, boxes[i][1]*ratioY)
        if (distances[i]>0) {
            ctx.fillText(labels[i], boxes[i][0]*ratioX, boxes[i][1]*ratioY);
            ctx.fillText("D:"+distances[i], boxes[i][0]*ratioX, boxes[i][1]*ratioY+15);
        }
    }
}
function carViewSnap(runNo) {
    var beginTime = new Date().getTime();
    var snappedImage = getCarView(grepVideoWidth);
    var imageString = snappedImage.split(",")[1];
    var data = { num: runNo, time: beginTime, imageString: imageString };
    // console.log("carview size: ", imageString.length)
    $.post("/video_driver", data, function (receive) {
        // if (playVideo){
        if (runNo > 30000)
            carViewSnap(-1); // Thia'a break car view python script
        else if (runNo != -1)
            carViewSnap(runNo + 1);
    // }
        var webTime = receive.time[0];
        var nodeTime = receive.time[1];
        var pyTime = receive.time[2];
        var webToNodeTime = nodeTime - webTime;
        var nodeToPyTime = pyTime - nodeTime;
        var pyToWebTime = new Date().getTime() - pyTime;
        var outStr = "";
        var landShift = receive.landShift;
        var colorStr = "255, 100, 100";
        var landRisk = "high";
        if (parseFloat(landShift) < 0.6) {
            colorStr = "0, 255, 0"
            landRisk = "low";
        }
        // var colorStr = (parseFloat(landShift) < 0.6) ? "0, 255, 0" : "255, 100, 100";
        var velocity = receive.velocity;
        outStr += `<p>landShift: ${landShift}</p>`;
        outStr += `<p>velocity: ${velocity}</p>`;
        outStr += "<p>Send" + receive.inputID + "</p><p>web to node time: " + webToNodeTime;
        outStr += `</p><p>node to py time: ${nodeToPyTime}</p>`;
        outStr += `<p>py to web time: ${pyToWebTime}</p>`;
        // displayCarViewText.innerHTML = outStr;
        var dataObj = {speed: {score: velocity, risk: "low"}, land: {score: parseInt(landShift*100), risk:landRisk}};
        placeResultValue(dataObj);
        var landPts = JSON.parse(receive.landPts);
        if (landPts.length > 0) {
            // console.log("landPts.length",landPts[0]);

            drawPolygon(canvas, landPts, colorStr);
        }
        var labels = receive.labels.replace(/'/g, '"')
        var boxes = JSON.parse(receive.boxes);
        labels = JSON.parse(labels);
        var distances = JSON.parse(receive.distances);
        if (labels.length > 0)
            drawLabels(canvas, labels, boxes, distances);
        distances = distances.filter(item => !(item < 0));
        var minDist = Math.min.apply(Math,distances)
        var distRisk = (minDist < 10)? "high" : "low";
        dataObj = {distance: {score: minDist, risk: distRisk}};
        placeResultValue(dataObj);
        var dataURI = canvas.toDataURL(`image/jpeg`);
        displayCarView.src = dataURI;
    });
}

function playAlarmAudio(type) {
    var randomNum = Math.floor(Math.random()*2);
    // if (type==0  && audioPlayFlag) { // fatigue
    if (type==0) { // fatigue
        // audioPlayFlag = false;
        if (randomNum==0) {
            // play(yodelBufferF);
            audioPlay.fatigueF.play();
        }
        else {
            // play(yodelBufferF);
            audioPlay.fatigueM.play();
        }
    // } else if (type==1 && audioPlayFlag) { // warning
    } else if (type==1) { // warning
        // audioPlayFlag = false;
        if (randomNum==0) {
            // play(yodelBuffer);
            audioPlay.warningF.play();
        }
        else {
            // play(yodelBuffer);
            audioPlay.warningM.play();
        }
    }
}
function logoutAction() {
    localStorage.removeItem("yourName");
    localStorage.removeItem("token");
    $.post("/login/logout", {token: token}, function(receive) {
        console.log("Logout");
        window.location.href = `./`;
    });
}