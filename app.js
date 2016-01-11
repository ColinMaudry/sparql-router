var express = require('express');
var app = express();
var fs = require('fs');


app.use(express.static('public'));

var sparqlPath = __dirname + "/public/sparql";
var sparqlFiles = fs.readdirSync(sparqlPath);

app.get('/',function(request,response) {
	response.send("Hello");
});
app.get('/tables/:name',function(request,response) {
	var name = request.params.name;
	var foundQuery = false;
	for (key in sparqlFiles) {
		console.log("Trying " + name + " vs. " + stringBefore(sparqlFiles[key]));
		if (stringBefore(sparqlFiles[key]) == name) {
			console.log('Im in!');
			fs.readFile(sparqlPath + '/' + sparqlFiles[key],'utf8', function (err, data) {
	  			if (err) throw err;
	 			 response.send(data);
	 			 response.end();
			});	 
			foundQuery = true;
		}
	};
	if (foundQuery == false) {
		response.status(404).send(name + ': This query does not exist.\n');
	}
});

module.exports = app;

app.listen(3000,function(){
	console.log('Started app on port 3000.')
});

function stringBefore(str) {
 var i = str.indexOf(".");

 if(i > 0)
  return  str.slice(0, i);
 else
  return str;     
}