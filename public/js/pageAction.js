import RiskPlot from "./risk.js";
var riskPlots = {fatigue: new RiskPlot(50, 100), speed: new RiskPlot(110,130),
    land: new RiskPlot(60, 120), distance: new RiskPlot()}
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

$(document).ready(function () {
    // var uMovBtnEle = document.getElementById('uMovBtn');
    // if (uMovBtnEle != null && uMovBtnEle.value == '') {
    //     uMovBtnEle.onclick = uImgBtnAction;
    //     var storeData = document.getElementById('storeData').value;
    //     storeData = JSON.parse(storeData);
    //     placeResultValue(storeData);
    // }
    // Method of uploading file.
    // const fileUploader = document.querySelector('#uImgForm');
    // formData = new FormData();
    // fileUploader.addEventListener('change', (e) => {
    //     console.log("fileUploader: ",e.target.files); // get file object
    //     formData.append("myfile", e.target.files[0])
    // });
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
// function uImgBtnAction(event) {  
// function uImgBtnAction() {  
//     console.log('uImgBtnAction(event)')  
//     var postUrl; 
//     // if (event.srcElement.id=='uMovBtn') {
//     postUrl = "/uMov/upload_file"; // Need confirm with wolf
//     // }
//     let photo = document.getElementById("image-file").files[0];
//     let formData = new FormData();
//     formData.append("myfile", photo);  // The 1st param should be the same as input name.
//     $.ajax({
//         type: "post",
//         url: postUrl,
//         data: formData,
//         processData: false,  // This's for invocation error
//         contentType : false,
//         enctype: "multipart/form-data"
//     }).done(response => {
//         document.getElementById('displayResponse').innerText = response;
//         document.getElementById("image-file").value = "";
//         console.log(response);
//     })
// }

function serializeToJSON(data) {
    var values = {};
    for (index in data) {
        values[data[index].name] = data[index].value;
    }
    // return JSON.stringify(values)
    return values;
}

function sendFrameInterval() {
    // webCamSnap(num);
    // num+=1;
    // var intervalID = setInterval(() => {
    webCamSnap(num);
    num += 1
    // if (num>200) { 
    //     num = -1; //end python
    //     // clearInterval(intervalID);
    // }
    // }, 50);
}
function webCamSnap(runNo) {
    var beginTime = new Date().getTime();
    storeNum.push(beginTime);
    Webcam.snap(function (snappedImage) {
        console.log("snappedImage", snappedImage);
        var imageString = snappedImage.split(",")[1];
        // console.log("imageString",imageString);
        var data = { num: runNo, time: beginTime, imageString: imageString };
        $.post("/realtime", data, function (receive) {
            // var webTime = receive.time[0];
            // var nodeTime = receive.time[1];
            // var pyTime = receive.time[2];
            realImg.src = `data:image/jpeg;base64,${receive.imageString}`;
            console.log('receive.imageString', receive.imageString)
            // var resInt = parseInt(receive.result);
            // var webToNodeTime = nodeTime - webTime;
            // var nodeToPyTime = pyTime - nodeTime;
            // var pyToWebTime = new Date().getTime() - pyTime;
            // var outStr = "Send"+receive.result + " web to node time: "+webToNodeTime;
            // outStr += ` node to py time: ${nodeToPyTime}`;
            // outStr += ` py to web time: ${pyToWebTime}`;
            // displayText.innerText = outStr;

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
}

// function getCarView(carVideo) {
//     var canvas = document.createElement('canvas');
//     // console.log('carVideo.width',carVideo.videoWidth,carVideo.videoHeight)
//     var ratio = carVideo.videoWidth / carVideo.videoHeight; // original viedo width
//     if (carVideo.width == 0)
//         carVideo.width = carVideo.videoWidth;
//     canvas.width = carVideo.width;//carVideo video id='videoX'
//     canvas.height = carVideo.width / ratio;
//     var ctx = canvas.getContext('2d');
//     //draw image to canvas. scale to target dimensions
//     // console.log("canvas.width, canvas.height",canvas.width, canvas.height);
//     ctx.drawImage(carVideo, 0, 0, canvas.width, canvas.height);
//     var dataURI = canvas.toDataURL('image/jpeg');
//     dataURI = dataURI.split(",")[1];
//     // displayCarImg.src = dataURI;
//     // console.log("dataURI: ",dataURI); 
//     return dataURI;
// }
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
    var data = { num: runNo, imageString: dataURI };
    $.post("/video_face", data, function (receiveY) {
        if (playVideo)
            video_face(faceVideo, runNo + 1)
        // console.log(receiveY.score)
        var fatRisk = (receiveY.score<0.5)? 'low' : 'high';
        var dataObj = {fatigue: {score: parseInt(receiveY.score*100), risk: fatRisk}};
        placeResultValue(dataObj);
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
        var dataURI = canvas.toDataURL(`image/jpeg`);
        displayCarView.src = dataURI;
    });
}
