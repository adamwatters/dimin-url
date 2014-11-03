var express = require("express");
var app = express();


app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/public"));

var urlKeys = [];

app.get("/longURL", function(request, response) {
	var longURL = request.query.link;
	var key = Math.floor(1000 * Math.random());
	urlKeys[key] = {longURL: longURL, visits: 0};

	var shortURL = "localhost:8080/r?k=" + key;
	response.render("response.ejs", {shortURL: shortURL});
});

app.get("/r", function(request, response) {
	var key = request.query.k;
	response.redirect(urlKeys[key].longURL);
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

