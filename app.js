var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http');
var debug = require('debug');

/*
The MIT License (MIT)

Copyright (c) 2016 Colin Maudry (http://colin.maudry.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/

express.static.mime.define({'application/sparql-query': ['rq']});

//Load custom configuration file
eval(fs.readFileSync('config.js', encoding="utf8"));

app.use(express.static('public'))

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

app.get('/:type(tables|graphs)/:name(\\w+):dot(\.)?:extension(\\w+)?',function(request,response) {
	var sparqlPath = __dirname + "/public/" + request.params.type;
	var sparqlFiles = fs.readdirSync(sparqlPath);
	var name = request.params.name;
	var foundQuery = false;

	for (key in sparqlFiles) {

		//If the URL fragment matches a query file name, return the query text
		if (stringBefore(sparqlFiles[key],'.') == name) {
			fs.readFile(sparqlPath + '/' + sparqlFiles[key],'utf8', function (err, data) {
	  			if (err) throw err;
	  			if (request.params.extension) {
					var foundExtension = false;
					for (var extension in config.typeByExtension[request.params.type]) {
						if (extension == request.params.extension) {
							request.headers.accept = config.typeByExtension[request.params.type][extension];
							foundExtension = true;
						}
					}
					if (foundExtension == false) {
						var extensions = '';
						for (var i = 0; config.typeByExtension[request.params.type].length; i++) {
						extensions += config.typeByExtension[request.params.type][i] + " ";
					}
						response.status(400).send(request.path + ': extension "'
							+ request.params.extension + '" not valid for ' + [request.params.type] + '. Authorized extensions: '
							+ extensions + '\n');
					} else {
						getQuery(request, response, data);
					}
	  			} else {
	  				getQuery(request, response, data);
	  			}
			});	 
			foundQuery = true;
		}
	};
	//Otherwise, return 404
	if (foundQuery == false) {
		response.status(404).send(request.params.type + "/" + request.params.name + ': This query does not exist.\n');
	}
});

app.post('/:type(tables|graphs)/:name', function(request,response) {
	var sparqlPath = __dirname + "/public/" + request.params.type;
	var name = request.params.name;
	var filepath = sparqlPath + '/' + name + '.rq';
	var query = '';
	var fileExists = false;

	request.on('data', function (data) {
     	 // Append data.
      	query += data;
  	});
  	request.on('end', function () {
      	if (query == undefined) {
			response.status(400)
			.send("You must pass your SPARQL query as data to create or modify a query.");
		} else {
			fs.stat(filepath,function(err, stats){
				if (err) {
					fileExists = false;

				}
			});
			fs.writeFile(filepath,query,'utf8', function (err) {
				if (err) {
					console.log(err);
					response.status(500).send("There was an error writing the file.");
				} else {
					if (fileExists = true) {
						response.status(201).send("The query was updated.");
					} else {
						response.status(201).send("The query was created.");
					}
				}
			});	
	}
   	});	
});

app.get('/',function(request,response) {
	response.send("Hello");
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
	if (request.get('accept')) options.headers['Accept'] = request.get('accept');

	debug("Accept: " + request.get('accept'));

	var req = http.request(options, (res) => {
	  	debug(`HEADERS: ${JSON.stringify(res.headers)}`);
		res.setEncoding('utf8');
		res.on('data', (data) => {
			debug("Returned format: " + res.headers["content-type"]);
			response
			.status(res.statusCode)
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
