var express = require('express');
var router = express.Router();
// run python with spawn
const { spawn } = require('child_process');
const readline = require('readline');
var multer = require('multer')

// var num = 0;
var numRes;
// const child = spawn('python3', ['./python/opencv_in_img.py']);
// const driver_child = spawn('python3', ['./python/carView/nodeLandDetectByImg.py']);
const face_child = spawn('python3', ['./python/CNNModle/nodeFatigueDetectByImg.py']);
const realTimeDriver_child = spawn('python3', ['./python/carView/nodeLandDetectByCap.py']);
realTime_driver();

var tmpOutput = {
  returnCode: 200,
  img: './images/logos.png',
  data: {
    dist: { score: 65, risk: 'High' },
    conc: { score: 45, risk: 'Low' },
    eyeClosure: { score: 55, risk: 'Low' },
    blink: { score: 31, risk: 'Low' },
    yawn: { score: 78, risk: 'High' },
    emotion: { score: 10, risk: 'Low' },
    angry: { score: 25, risk: 'Low' },
    sad: { score: 0, risk: 'Low' },
    happy: { score: 0, risk: 'Low' }
  },
  token: -1
}
tmpOutput = JSON.stringify(tmpOutput);
/* GET home page. */
// router.get('/', function (req, res, next) {
//   res.render('layout', { ejsPage: 'index.ejs', data: '{}' });
// });
router.get('/', function (req, res, next) {
  res.render('index');
});
router.get('/realtime', function (req, res, next) {
  // tmpOutput = JSON.parse(tmpOutput);
  // tmpOutput.token = req.query.token;
  // console.log("token: ", tmpOutput.token);
  // var app = req.app;
  // var userList = app.get("userList");
  // console.log("token: ", tmpOutput.token, userList[tmpOutput.token]);
  // if (userList[tmpOutput.token]==undefined) {
  //   tmpOutput = JSON.stringify(tmpOutput);
  //   res.redirect("./");
  // } else {
  //   tmpOutput = JSON.stringify(tmpOutput);
    res.render('layout', { ejsPage: 'realtime.ejs', data: tmpOutput });
  // }
});
router.get('/video', function (req, res, next) {
  res.render('layout', { ejsPage: 'video.ejs', data: tmpOutput });
});
// router.post('/realtime', function (req, res, next) {
//   var imageString = req.body.imageString;
//   // const child = spawn('python3', ['./python/opencv_in_img.py']); // move to outside post
//   num = req.body.num
//   child.stdin.write(num + "," + imageString + "\n");
//   // child.stdin.end(); // This will only work once.

//   num += 1;
//   const rl = readline.createInterface({ input: child.stdout });
//   rl.on('line', data => {
//     // console.log('out a image', typeof data); // string
//     var imageString = data.toString('base64');
//     var splitL = imageString.split(",");
//     numRes = splitL[0]
//     imageString = splitL[1]
//     pythonTime = new Date().getTime();
//     // res.send({imageString:imageString});
//     console.log("[POST] OUT");
//     rl.close(); // make readline stop, this's very important step.
//     rl.removeAllListeners(); // make readline stop, this's very important step.
//     res.send({ result: `${numRes}`, imageString: imageString, time: [] });
//   });
//   child.on('exit', (code) => {
//     console.log(`Child process exited with code ${code}, num:${numRes}`);
//   });
//   child.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
//   });

// });

var myStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log('myStorage')
    cb(null, "public/images/video");    // 保存的路徑 (需先自己創建)
    // cb(null, "");    // 保存的路徑 (需先自己創建)
  },
  filename: function (req, file, cb) {
    cb(null, 'driver.mp4');  // 自定義檔案名稱
    // console.log('myStorage')
  }
});
// var upload = multer({dest:'upload/'});
var upload = multer({
  storage: myStorage,  // 設置 storage
  fileFilter: function (req, file, cb) {  // 檔案過濾
    // console.log('console.log(upload)',upload)
    if (file.mimetype != 'video/mp4') {
      return cb(new Error('Wrong file type'));
    }
    cb(null, true)
  }
});
//*************** */
// router.post('/uMov/upload_file',upload.single('myfile'), function(req, res, next) {
router.post('/upload_file', upload.single('myfile'), function (req, res, next) {
  console.log('upload_file req.body',req.body)
  // res.render('layout', { ejsPage: req.body.page +'.ejs', data: tmpOutput });
  res.redirect('/'+req.body.page);
});
var myStorage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log('myStorage')
    cb(null, "public/images/video");    // 保存的路徑 (需先自己創建)
    // cb(null, "");    // 保存的路徑 (需先自己創建)
  },
  filename: function (req, file, cb) {
    cb(null, 'face.mp4');  // 自定義檔案名稱
    // console.log('myStorage')
  }
});
// var upload = multer({dest:'upload/'});
var upload1 = multer({
  storage: myStorage1,  // 設置 storage
  fileFilter: function (req, file, cb) {  // 檔案過濾
    // console.log('console.log(upload)',upload)
    if (file.mimetype != 'video/mp4') {
      return cb(new Error('Wrong file type'));
    }
    cb(null, true)
  }
});
// router.post('/uMov/upload_file',upload.single('myfile'), function(req, res, next) {
router.post('/upload_file1', upload1.single('myfile'), function (req, res, next) {
  res.redirect('/'+req.body.page);
  // res.render('layout', { ejsPage: 'video.ejs', data: tmpOutput });
});

router.post('/video_driver', function (req, res, next) {
  var imageString = req.body.imageString;
  var nodeTime = new Date().getTime();
  var webTime = req.body.time;
  // console.log('imageString',imageString)
  // const child = spawn('python3', ['./python/opencv_in_img.py']); // move to outside post
  num = req.body.num
  console.log('video_driver num', num)
  driver_child.stdin.write(num + "," + imageString + "\n");
  // chvideo_childild.stdin.end(); // This will only work once.

  num += 1;
  const rl = readline.createInterface({ input: driver_child.stdout });
  rl.on('line', data => {
    // console.log('out a image', typeof data); // string
    var dataString = data.toString('base64');
        var dataJson = JSON.parse(dataString);
        dataJson['code'] = 200; // add code and time infomation.
        pythonTime = new Date().getTime();
        dataJson['time'] = [webTime, nodeTime, pythonTime];
    rl.close(); // make readline stop, this's very important step.
    rl.removeAllListeners(); // make readline stop, this's very important step.
    // res.send({result: `${numRes}`,imageString:imageString, time:[]});
    res.send(dataJson);
  });
  driver_child.removeAllListeners('exit');
  driver_child.stderr.removeAllListeners('data');
  driver_child.on('exit', (code) => {
    console.log(`driver_child Child process exited with code ${code}, num:${numRes}`);
  });
  driver_child.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

});
router.post('/video_face', function (req, res, next) {
  var imageString = req.body.imageString;
  // console.log('imageString',imageString.slice(0,10))
  // const child = spawn('python3', ['./python/opencv_in_img.py']); // move to outside post
  num = req.body.num
  console.log('face_child num', num)
  face_child.stdin.write(num + "," + imageString + "\n");
  // chvideo_childild.stdin.end(); // This will only work once.

  num += 1;
  const rl = readline.createInterface({ input: face_child.stdout });
  rl.on('line', data => {
    // console.log('out a image', typeof data); // string

    var dataString = data.toString('base64');
    try {
      var dataJson = JSON.parse(dataString);
      dataJson['code'] = 200; // add code and time infomation.
    }
    catch (error){
      var dataJson = {"inputID":0,"score":0};
      dataJson['code'] = 1; // add code and time infomation.
    }
    rl.close(); // make readline stop, this's very important step.
    rl.removeAllListeners(); // make readline stop, this's very important step.
    // res.send({result: `${numRes}`,imageString:imageString, time:[]});
    dataJson.realTimeDriver_dataJson = realTimeDriver_dataJson
    res.send(dataJson);
    // console.log('face dataJson',dataJson)
  });
  face_child.removeAllListeners('exit');
  face_child.stderr.removeAllListeners('data');
  face_child.on('exit', (code) => {
    console.log(`face_child Child process exited with code ${code}, num:${numRes}`);
  });
  face_child.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

});
var realTimeDriver_dataJson = {}
// router.post('/realTime_driver', function (req, res, next) {
  function  realTime_driver () {
    // console.log('realTime_driver')
  // var imageString = req.body.imageString;
  var nodeTime = new Date().getTime();
  // var webTime = req.body.time;
  // console.log('imageString',imageString)
  // const child = spawn('python3', ['./python/opencv_in_img.py']); // move to outside post
  // num = req.body.num
  // console.log('realTimeDriver_child num', num)
  // chvideo_childild.stdin.end(); // This will only work once.

  // num += 1;
  const rl = readline.createInterface({ input: realTimeDriver_child.stdout });
  rl.on('line', data => {
    // console.log('out a image', typeof data); // string
    // console.log('out a image data', data); // string
    var dataString = data.toString('base64');
        var dataJson = JSON.parse(dataString);
        dataJson['code'] = 200; // add code and time infomation.
        pythonTime = new Date().getTime();
        // dataJson['time'] = [ nodeTime, pythonTime];
    // rl.close(); // make readline stop, this's very important step.
    //停止監聽
    // rl.removeAllListeners(); // make readline stop, this's very important step.
    //移除監聽
    // res.send({result: `${numRes}`,imageString:imageString, time:[]});
    // res.send(dataJson);
    realTimeDriver_dataJson = dataJson;
  });
  //下面4項realTimeDriver_child有錯誤時才會執行
  realTimeDriver_child.removeAllListeners('exit');
  realTimeDriver_child.stderr.removeAllListeners('data');
  realTimeDriver_child.on('exit', (code) => {
    console.log(`realTimeDriver Child process exited with code ${code}, num:${numRes}`);
  });
  realTimeDriver_child.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

};
// include(ejsPage, data)
// include(ejsPage, data)
module.exports = router;
