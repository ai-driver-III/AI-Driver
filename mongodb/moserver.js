var MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:aienfinal@cluster0.glsjj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// Connect to the db
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    console.log('mongodb is running!');
    //Write databse Insert/Update/Query code here..
    const collection = client.db("outputData").collection("testData");
    var myobj = { name: "test1", url: "www.google.com" };

    // collection.insertOne(myobj, function (err, res) {
    //     if (err) throw err;
    //     console.log("input success!");
    //     client.close();
    // });
    collection.find({}).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        client.close();
    });

});
