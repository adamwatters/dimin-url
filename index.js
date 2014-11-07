var express = require("express");
var http = require("http");
var https = require("https");
var app = express();


if (process.env.REDISTOGO_URL) {
    // deployed
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis = require("redis").createClient(rtg.port, rtg.hostname);
	//split username and password
	redis.auth(rtg.auth.split(":")[1]);
} else {
	//development
    var redis = require("redis").createClient();
}

app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/public"));

app.get("/longURL", function(request, response) {
	var shortURL;
	var domain = process.env.DOMAIN;
	var longURL = request.query.link;
	testLinkValid(longURL, function(goodLink) {
		if (goodLink) {
			setNewKey(longURL, function(key){
				shortURL = domain + "/r?k=" + key;
				response.send(shortURL);
			});
		} else {
			response.send("not a valid link");
		}
	})
});

app.get("/r", function(request, response) {
	var key = request.query.k;
	redis.get(key, function(err, data){
		if(err){
			console.log(err);
		} else {
			response.redirect(data);
		}
	});
});

var setNewKey = function(url, callback) {
	var key = Math.floor(Math.random() * 100000);

	redis.setnx(key, url, function(error, keySet){
		if (error) {
			console.log(error);
			return;
		} else if (keySet) {
			console.log(keySet);
			callback(key);
		} else {
			console.log(keySet);
			setNewKey(url, callback);
		}
	});
};

var testLinkNew = function() {
	return
};


var testLinkValid = function (link, callback) {
	var tester = http;
	if (link.substr(0,7) === "http://") {
		tester = http;
	} else if (link.substr(0,8) === "https://") {
		tester = https;
	}

	tester.get(link, function(res) {
		if (res.statusCode === 200 || 
			res.statusCode === 302 ||
			res.statusCode === 304){
			console.log("Got code: " + res.statusCode);
			callback(true);
		} else {
			callback(false);
		}
	}).on('error', function(e) {
	  	console.log("Got error: " + e.message);
	  	callback(false);
	});

};

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});



