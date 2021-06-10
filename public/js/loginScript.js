var working = false;
$('#signinForm').on('submit', function(e) {  
  console.log("submit");
  e.preventDefault();
  if (working) return;
  working = true;
  var $this = $(this),
    $state = $this.find('button > .state');
  console.log("$this", $this);
  $this.addClass('loading');
  $state.html('Authenticating');
  // This if for checking ok.
  setTimeout(function() {
    $this.addClass('ok');
    $state.html('Welcome back!');
    setTimeout(function() {
      $state.html('Face Log in');
      $this.removeClass('ok loading');
      working = false;
      Webcam.stopBothVideoAndAudio();
    }, 4000);
  }, 3000);
});
$('#signupForm').on('submit', function(e) {  
  console.log("sign up");
  e.preventDefault();
});
faceLogin.onclick = startCam;
signupTab.onclick = signupTabShow;
signinTab.onclick = signinTabShow;
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
function webCamSnap() {
  Webcam.snap(function (snappedImage) {
      console.log("snappedImage", snappedImage);
      var imageString = snappedImage.split(",")[1];
      // console.log("imageString",imageString);
      var data = { imageString: imageString };
      $.post("/faceLogin", data, function (receive) {
          console.log('receive', receive)

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