var MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:aienfinal@cluster0.glsjj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// Connect to the db
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('mongodb is running!'); 
        // client.close();
})
exports.insertOneAsync = function(data) {  
    return new Promise(function (resolve, reject) { 
        const collection = client.db("outputData").collection("faceCollection");
        //choose what db and collection
        // input intent
        collection.insertOne(data, function (err, res) {
            if (err) {
                reject(err);
                throw err;
            }
            console.log("faceCollection input success!");
            resolve(res);
            // client.close();
        });
    });
}
exports.findAsync = function(data) {  
    return new Promise(function (resolve, reject) { 
        const collection = client.db("outputData").collection("faceCollection");
        collection.find({}).toArray(function (err, result) {
            if (err) {
                reject(err);
                throw err;
            }
            console.log("find from db faceCollection success!");
            resolve(result);
            // client.close();
        });
    });
}
exports.insertDataCollectAsync = function(data) {  
    return new Promise(function (resolve, reject) { 
        const collection = client.db("outputData").collection("fatigueCollection");
        //choose what db and collection
        // input intent
        collection.insertOne(data, function (err, res) {
            if (err) {
                reject(err);
                throw err;
            }
            console.log("fatigueCollection input success!");
            resolve(res);
            // client.close();
        });
    });
}
exports.findDataCollectAsync = function(data) {  
    return new Promise(function (resolve, reject) { 
        const collection = client.db("outputData").collection("fatigueCollection");
        collection.find({}).toArray(function (err, result) {
            if (err) {
                reject(err);
                throw err;
            }
            console.log("find from db fatigueCollection success!");
            resolve(result);
            // client.close();
        });
    });
}
// exports.insertOneAsync = function(data) {
//     return new Promise(function (resolve, reject) {
//       MongoClient.connect(uri, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("outputData");
//         dbo.collection("faceCollection").insertOne(data, function(err, res) {
//           if (err) {
//             reject(err);
//             throw err;
//           }
//           console.log("1 document inserted");
//           resolve(res);
//           db.close();
//         });
//     });
//     });
// }

// exports.findAsync = function(data) {
//     return new Promise(function (resolve, reject) {
//     MongoClient.connect(uri, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("outputData");
//         dbo.collection("faceCollection").find({}).toArray(function (err, result) {
//             if (err) {
//                 reject(err);
//             }
//             // console.log(result);
//             resolve(result);
//             client.close();
//         });
//     });
//     });
// }