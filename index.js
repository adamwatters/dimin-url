var express = require("express");
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
	var longURL = request.query.link;
	var key = Math.random().toString(36).slice(13);
	redis.set(key, longURL);
	var domain = process.env.DOMAIN;
	var shortURL = domain + "/r?k=" + key;
	response.render("response.ejs", {shortURL: shortURL});
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

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

