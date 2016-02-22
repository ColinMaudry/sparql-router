var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http');

app.use(express.static('public'))
express.static.mime.define({'application/sparql-query': ['rq']});

//Load custom configuration file
eval(fs.readFileSync('config.js', encoding="utf8"));

var sparqlPath = __dirname + "/public/sparql";
var sparqlFiles = fs.readdirSync(sparqlPath);

app.get('/',function(request,response) {
	response.send("Hello");
});
app.get('/tables/:name',function(request,response) {

	var name = request.params.name;
	var foundQuery = false;
	for (key in sparqlFiles) {
		console.log("Trying " +  stringBefore(sparqlFiles[key]));

		//If the URL fragment matches a query file name, return the query text
		if (stringBefore(sparqlFiles[key]) == name) {
			fs.readFile(sparqlPath + '/' + sparqlFiles[key],'utf8', function (err, data) {
	  			if (err) throw err;

	  			var queryPath = config.endpoint.queryPath + '?' + config.endpoint.queryParameterName + '=' + encodeURIComponent(data);
	  			var accept = (request.get('Accept') == "") ? config.defaultAccept : request.get('Accept');
	  			console.log('Query path = ' + queryPath);

	  			var options = {
				  hostname: config.endpoint.host,
				  port: config.endpoint.port,
				  path: queryPath,
				  method: 'GET',
				  headers: {
				    'Accept': request.get('Accept')
				  }
				};

				var req = http.request(options, (res) => {
				  console.log(`STATUS: ${res.statusCode}`);
				  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
				  res.setEncoding('utf8');
				  res.on('data', (chunk) => {
				    console.log(`BODY: ${chunk}`);
				    response.status(200).set('Content-Type', res.headers["content-type"]).send(chunk);
				  });
				  res.on('end', () => {
				    console.log('No more data in response.')
				  })
				  if (res.statusCode == 404) {
					response.status(500).send("Problem with request: configured SPARQL endpoint not found.\n");
				}
				});



				req.on('error', (e) => {
				  console.log(`Problem with request: ${e.message}`);
				  response.status(500).send(`Problem with request: ${e.message}\n`);
				});

				req.end();

			});	 
			foundQuery = true;
		}
	};
	//Otherwise, return 404
	if (foundQuery == false) {
		response.status(404).send(name + ': This query does not exist.\n');
	}
});

module.exports = app;

// app.listen(3000,function(){
// 	console.log('Started app on port 3000.')
// });

function stringBefore(str) {
 var i = str.indexOf(".");

 if(i > 0)
  return  str.slice(0, i);
 else
  return str;     
}