var working, iconHeight;
const WEBCAM_OPEN_TIME = 3000;
const WAIT_FOR_REDIRECT = 3000;
$(document).ready(function(){
  working = false;
  iconHeight = document.getElementsByClassName("icon")[0].height;
  iconWidth = document.getElementsByClassName("icon")[0].width;
  // console.log("get height", iconHeight);
  if (iconHeight==0) 
    iconHeight = 300;
  if (iconWidth==0) 
    iconWidth = 300;
});
$('#signinForm').on('submit', function(e) {  
  e.preventDefault();
  if (working) return;
  working = true;
  var $this = $(this),
    $state = $this.find('button > .state');
  // console.log("$this", $this);
  // $this.addClass('loading');
  $state.html('Authenticating');
  startCam('#webcamDiv');
  // This if for checking ok.
  setTimeout(function() {
    $this.addClass('loading');
    faceLoginAction();
    Webcam.stopBothVideoAndAudio();
    $('#webcamDiv').html('<img class="icon" src="./images/faceLoginIcon.png">');
  }, WEBCAM_OPEN_TIME);
});
$('#signupForm').on('submit', function(e) {  
  e.preventDefault();
  if (working) return;
  working = true;
  var $this = $(this),
    $state = $this.find('button > .state');
  // console.log("$this", $this);
  // console.log("userName.value:",userName.value)
  if (userName.value.length <3) {
    // $this.addClass('loading');
    $state.html('User Name Invalid');
    working = false;  
  } else {
    startCam('#webcamDiv2');
    $state.html('Registering');
    setTimeout(function() {
      $this.addClass('loading');
      faceRegisterAction(userName.value);
      Webcam.stopBothVideoAndAudio();
      $('#webcamDiv2').html('<img class="icon" src="./images/faceLoginIcon.png">')
    }, WEBCAM_OPEN_TIME);
  }
});
// faceLogin.onclick = startCam;
// faceSignup.onclick = startCam2;
signupTab.onclick = signupTabShow;
signinTab.onclick = signinTabShow;
function startCam(cssStr) {
  // WebCam 啟動程式
  Webcam.set({
      // width: 160,
      // height: 120,
      width: iconWidth,
      height: iconHeight,
      image_format: 'jpeg',
      jpeg_quality: 90,
      id: 'videoY'
  });
  Webcam.attach(cssStr);
}

function faceRegisterAction(name) {
  Webcam.snap(function (snappedImage) {
    // console.log("snappedImage", snappedImage);
    var imageString = snappedImage.split(",")[1];
    // console.log("imageString",imageString);
    var data = { userName: name, imageString: imageString };
    $.post("/login/faceRegister", data, function (receive) {
        // console.log('receive', receive);
        if (receive.code==200) {
          $("#signupForm").addClass('ok');
          $("#signupText").html(receive.result);
        } else {
          $("#signupText").html(receive.result);
        }
        working = false;  
        setTimeout(function() {
          $("#signupText").html('Face Sign up');
          $("#signupForm").removeClass('ok loading');
        }, WAIT_FOR_REDIRECT);
    });
});  // End of Webcam.snap
}

function faceLoginAction() {
  Webcam.snap(function (snappedImage) {
    // console.log("snappedImage", snappedImage);
    var imageString = snappedImage.split(",")[1];
    // console.log("imageString",imageString);
    var data = { imageString: imageString };
    $.post("/login/faceLogin", data, function (receive) {
        // console.log('receive', receive);
        if (receive.code==0) {
          $("#signinForm").addClass('ok');
          $("#signinText").html("Welcome back "+receive.result);
          var token = receive.token;
          setTimeout(function() {
            $("#signinText").html('Face Log in');
            $("#signinForm").removeClass('ok loading');
            localStorage.setItem("yourName",receive.result);
            localStorage.setItem("token",token);
            // window.location.href = `./realtime?token=${token}`;
            window.location.href = `./realtime`;
          }, WAIT_FOR_REDIRECT);
        } else {
          $("#signinText").html("Authenticating fail");
          setTimeout(function() {
            $("#signinText").html('Face Log in');
            $("#signinForm").removeClass('ok loading');
          }, WAIT_FOR_REDIRECT);
        }
        working = false;  
    });
});  // End of Webcam.snap
}
function signupTabShow() {
    signinTab.className = "tablinks";
    signupTab.className = "tablinks active";
    signinForm.className = "tabcontent";
    signupForm.className = "";
}
function signinTabShow() {
  signinTab.className = "tablinks active";
  signupTab.className = "tablinks";
  signinForm.className = "";
  signupForm.className = "tabcontent";
}