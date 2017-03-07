var express = require('express');
var bodyparser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

console.log('got here');

var app = express();
var db;
var postTable;
var userTable;

MongoClient.connect('mongodb://localhost:27017/examenPrep', function(err, _db) {
	if(err){
		console.log("conection to database failed");
		throw err;
	}
	db = _db;
	postTable = db.collection('posts');
  userTable = db.collection('users');
  console.log("conected to mongodb database");
});

process.on('SIGINT', function() {
	db.close();
  console.log("quited database conection in a proper manner");
	process.exit(0);
});


app.use(express.static('client'));
app.use(bodyparser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/api/getPosts', function(req,res){
  postTable.find().sort({_id:-1}).toArray(function(err, result){
    if (err) throw err;
    res.status(200).json(result);
  });
});

app.post('/api/sendPost', function(req,res){
  postTable.insert(req.body,function (err, result) {
    if (err) throw err;
    res.status(201).json(null);
  });
});

app.post('/api/deletePost', function (req,res) {
  var post = {"username":req.body.username, "message":req.body.message};
  postTable.deleteOne(post,function (err ,result) {
    if (err) throw err;
    res.status(201).json(null);
  });
});

app.post('/api/upvotePost', function (req , res) {
  console.log(req.body);
  var post = {"username":req.body.username, "message":req.body.message};
  console.log(post);
  var newVotes = req.body.votes + 1;
  postTable.updateOne(post,{
    $set: { "votes":newVotes },
    $currentDate: { "lastModified": true}
  },function (err , result) {
    if (err) throw err;
    console.log(result);
    res.status(200).json(null);
  });
});

app.post('/api/checkUser', function(req,res){
  userTable.find({"username":req.body.username}).toArray(function(err ,result){
    if (err) throw err;
    if (result[0]) {
      if (result[0].password == req.body.password) {
        res.status(200).json(result);
      } else {
        res.status(200).json(null);
      }
    } else {
      res.status(200).json(null);
    }
  });
});

app.post('/api/createUser', function(req,res){
  userTable.find({"username":req.body.username}).toArray(function(err ,result){
    if (err) throw err;
    if (result.length>0) {
      res.status(200).json(result);
    } else {
      userTable.insert(req.body,function (err,r) {
        if(err) throw err;
        res.status(200).json(null);
      })
    }
  });
});




app.listen(3000)
