import RiskPlot from "./risk.js";
$(document).ready(function() {
    var uMovBtnEle = document.getElementById('uMovBtn');
    if (uMovBtnEle != null && uMovBtnEle.value == '') {
        uMovBtnEle.onclick = uImgBtnAction;
        var storeData = document.getElementById('storeData').value;
        storeData = JSON.parse(storeData);
        placeResultValue(storeData);
    }
    // Method of uploading file.
    // const fileUploader = document.querySelector('#uImgForm');
    // formData = new FormData();
    // fileUploader.addEventListener('change', (e) => {
    //     console.log("fileUploader: ",e.target.files); // get file object
    //     formData.append("myfile", e.target.files[0])
    // });
    var sCamBtnEle = document.getElementById('sCamBtn');
    if (sCamBtnEle != null && sCamBtnEle.value == '')
        sCamBtnEle.onclick = sCamBtnAction;
    var aImage;
});
function placeResultValue(dataObj) {
    var keys = Object.keys(dataObj);
    keys.forEach(key => {
        var score = dataObj[key].score;
        var risk = dataObj[key].risk;
        var tmpRiskPlot = new RiskPlot();
        tmpRiskPlot.setBoard(score, risk);
        var tmpSEle = document.getElementById(key+'Score');
        tmpSEle.innerText = score;
        var tmpREle = document.getElementById(key+'Risk');
        tmpREle.appendChild(tmpRiskPlot.board);
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
        contentType : false,
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
function uImgBtnAction(event) {    
    var postUrl;
    if (event.srcElement.id=='uMovBtn') {
        postUrl = "/uMov/upload_file"; // Need confirm with wolf
    }
    let photo = document.getElementById("image-file").files[0];
    let formData = new FormData();
    formData.append("myfile", photo);  // The 1st param should be the same as input name.
    $.ajax({
        type: "post",
        url: postUrl,
        data: formData,
        processData: false,  // This's for invocation error
        contentType : false,
        enctype: "multipart/form-data"
    }).done(response => {
        document.getElementById('displayResponse').innerText = response;
        document.getElementById("image-file").value = "";
        console.log(response);
    })
}

function serializeToJSON(data) {
    var values = {};
    for(index in data){
        values[data[index].name] = data[index].value;
    }
    // return JSON.stringify(values)
    return values;
}