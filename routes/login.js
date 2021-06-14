const express = require("express");
var db = require('../db');
var router = express.Router();
// run python with spawn
const { spawn } = require('child_process');
const readline = require('readline');

/// following code using spawn to run python
// var num = 0;
router.post("/faceLogin", async function(req, res) {
    console.log("[login IN]");
    const child = spawn('python3', ['./python/faceLogin.py']); // move to outside post
    var result = await db.findAsync();
    // result = JSON.parse(result);  // for fs write
    var nameList = [], face_descriptor = [];
    for (var singleData of result) {
        nameList.push(singleData.userName);
        face_descriptor.push(singleData.face_descriptor);
    }
    var imageString = req.body.imageString;
    console.log("input image:", imageString.length);
    child.stdin.write(imageString+"\n");
    child.stdin.write(nameList+"\n");
    child.stdin.write(face_descriptor+"\n");
    const rl = readline.createInterface({ input: child.stdout });
    var dataJson = {code:1, token:-1};
    rl.on('line', data => {
        console.log("[login PY return]");
        var dataString = data.toString('base64');
        dataJson = JSON.parse(dataString);
        console.log(dataJson);
        rl.close(); // make readline stop, this's very important step.
        rl.removeAllListeners(); // make readline stop, this's very important step.
        // var backJSON = {code:200, result: "Welcome back Jack"};
        // store data in req.app ***
        var randomNum = Math.floor(Math.random()*10000);
        dataJson.token = randomNum;
        var app = req.app;
        var userList = app.get("userList");
        // find duplicate and remove it
        var duplicateKey = Object.keys(userList).filter(key => userList[key] === dataJson.result);
        for (var i of duplicateKey) {
            delete userList[i];
        }
        userList[randomNum] = dataJson.result;
        app.set("userList", userList)
        console.log("userList:",userList);
    }); 
    child.on('exit', (code) => {
        dataJson.code = code;
        res.send(dataJson);
        console.log(`Face login Child process exited with code ${code}`);
    });
    child.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
});
router.post("/faceRegister", function(req, res) {
    var imageString = req.body.imageString;
    var userName = req.body.userName;
    const childReg = spawn('python3', ['./python/register.py']); // move to outside post
    childReg.stdin.write(imageString+"\n");
    const rl = readline.createInterface({ input: childReg.stdout });
    rl.on('line', async function(data) {
        var dataString = data.toString('base64');
        var dataJson = JSON.parse(dataString);
        rl.close(); // make readline stop, this's very important step.
        rl.removeAllListeners(); // make readline stop, this's very important step.
        var dbJson = {userName: userName,
            face_descriptor: dataJson[0]};
        // console.log("dbJson:",dbJson);
        var result = await db.findAsync();
        // var result = JSON.parse(resultStr);  // for fs write
        var nameList = [];
        for (var singleData of result) {
            nameList.push(singleData.userName);
        }
        if (nameList.indexOf(userName)==-1) {
            // dbJson = JSON.stringify(dbJson); // for fs write
            // dbJson = resultStr.slice(0,-1)+","+dbJson+"]"; // for fs write
            var result = await db.insertOneAsync(dbJson);
            var backJSON = {code:200, result:"Regiser ok."};
            // var result = db.insertOne(dbJson)
        } else {
            var backJSON = {code:0, result:'Name existed.'};
        }
        // console.log("findAll:",result, typeof result);
        res.send(backJSON);
    }); 
    childReg.on('exit', (code) => {
        console.log(`Register Child process exited with code ${code}`);
    });
    childReg.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
});
router.post("/dbCollectData", async function(req, res) {
    var app = req.app;
    var userList = app.get("userList");
    var token = req.body.token;
    var dataToDB = req.body.data;
    dataToDB = JSON.parse(dataToDB);
    console.log("dataToDB:",dataToDB, userList[token]);
    dataToDB['userName'] = userList[token];
    var result = await db.insertDataCollectAsync(dataToDB);
    res.send(result);
});
router.post("/logout", function(req, res) {
    var token = req.body.token;
    var app = req.app;
    var userList = app.get("userList");
    console.log("Logout:", token, userList[token]);
    delete userList[token];
    res.send({code:0});
});
module.exports = router;
