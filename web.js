// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());

// Static file serving
app.use(express.static(__dirname + '/app'));


// Databaseeeee

var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

mongo.MongoClient.connect(mongoUri, function (err, db) {
	if(!err) {
		console.log('Connected to \'happiness_db\' database');
		db.collection('happiness', {strict: true}, function(err, collection) {
			if(err) {
				console.log('The \'happiness\' collection does not exist');
				console.log('Creating empty collection \'happiness\'');
				
				db.createCollection('happiness', function(err, collection) {});
			}
		});
	}
});



// API Routes

var apiPrefix = '/api/1';

app.get(apiPrefix + '/happiness', function(req, res) {
	var entry = {
		timestamp: Date.now(),
		value: req.query.value
	};

	// Try storing in the database
	mongo.MongoClient.connect(mongoUri, function (err, db) {
		db.collection('happiness', function(err, collection) {
			collection.insert(entry, {w:1}, function(err, result) {
				if(err) {
					res.send({ error: 'An error has occured' });
				} else {
					console.log('Success', JSON.stringify(result[0]));
					res.send(result[0]);
				}
			});
		});
	});
});


app.get('/dump', function(req, res) {
	// Try storing in the database
	mongo.MongoClient.connect(mongoUri, function (err, db) {
		db.collection('happiness', function(err, collection) {
			collection.find().toArray(function(err, items) {
				res.send({message: 'success', items: items});
			});
		});
	});
});



// Start listening

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});


