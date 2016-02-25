var express = require('express');
var app = express();
var fs = require('fs');
var http = require('follow-redirects').http;
var debug = require('debug');

express.static.mime.define({'application/sparql-query': ['rq']});

//Load custom configuration file
eval(fs.readFileSync('config.js', encoding="utf8"));

app.use(express.static('public'))

app.get('/',function(request,response) {
	response.send("Hello");
});

app.get('/tables/:name',function(request,response) {
	var tablesSparqlPath = __dirname + "/public/tables";
	var tablesSparqlFiles = fs.readdirSync(tablesSparqlPath);
	var name = request.params.name;
	var foundQuery = false;

	for (key in tablesSparqlFiles) {

		//If the URL fragment matches a query file name, return the query text
		if (stringBefore(tablesSparqlFiles[key],'.') == name) {
			fs.readFile(tablesSparqlPath + '/' + tablesSparqlFiles[key],'utf8', function (err, data) {
	  			if (err) throw err;
	  			getQuery(request, response, data);
			});	 
			foundQuery = true;
		}
	};
	//Otherwise, return 404
	if (foundQuery == false) {
		response.status(404).send(request.path + ': This query does not exist.\n');
	}
});

app.get('/query',function(request,response) {
	var query = request.query.query;
	if (query == undefined) 
		{
			response.redirect(301, '/sparql');
		} else {
			response.redirect(301, '/sparql?query=' + query);	
	}
});

app.get('/sparql',function(request,response) {
	var query = request.query.query;
	debug(query);
	if (query == undefined) 
		{
			response.status(400).send("With GET, you must pass your SPARQL query in the 'query' parameter");
		} else {
			getQuery(request, response, query);	
	}
});

app.get('/sparql',function(request,response) {
	var query = request.query.query;
	debug(query);
	if (query == undefined) 
		{
			response.status(400).send("With GET, you must pass your SPARQL query in the 'query' parameter");
		} else {
			getQuery(request, response, query);	
	}
});

app.post('/query',function(request,response) {
	response.redirect(301, '/sparql');
});

app.post('/sparql',function(request,response) {
	var query = '';

   	request.on('data', function (data) {
     	 // Append data.
      	query += data;
  	});

   	request.on('end', function () {
      	if (query == undefined) {
			response.status(400).send("With POST, you must pass your SPARQL query as data.");
		} else {
			getQuery(request, response, query);	
	}
   	});
	
});



module.exports = app;


function stringBefore(str, sep) {
 var i = str.indexOf(sep);

 if(i > 0)
  return  str.slice(0, i);
 else
  return str;     
}

function getQuery(request,response, data) {
	var queryPath = config.endpoint.queryPath + '?'
		+ config.endpoint.queryParameterName + '=' + encodeURIComponent(data);
	var options = {
		  hostname: config.endpoint.host,
		  port: config.endpoint.port,
		  path: queryPath,
		  method: 'GET',
		  headers: {}
	};
	if (request.get('Accept')) options.headers.Accept = request.get('Accept');

	var req = http.request(options, (res) => {
	  	debug(`HEADERS: ${JSON.stringify(res.headers)}`);
		res.setEncoding('utf8');
		res.on('data', (data) => {
			response.status(res.statusCode)
			.set('Content-Type', res.headers["content-type"]).send(data);
		});
		res.on('end', () => {
		   debug('No more data in response.')
		})
	});
	req.on('error', (e) => {
		console.log('Error: problem with request: ${e.message}');
		response.status(500).send('Problem with request: ${e.message}\n');
	});
	req.end();
};
