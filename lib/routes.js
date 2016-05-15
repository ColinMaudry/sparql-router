var passport = require('passport');
var config = require('config');
var debug = require('debug');
var http = require('http');
var fs = require('fs');



//My functions
var functions = require('./functions');


/*
MIT License (MIT)

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

module.exports = function(app) {

app.get('/api/hydra',function(request,response) {
	var result = functions.getHydraTemplate("EntryPoint",request.path);
	result["@context"] = "/hydra/entry.jsonld";
	result["tableQueries"] = "/api/tables";
	result["graphQueries"] = "/api/graphs";

	result = JSON.stringify(result,null,'\t');

	response.set('Content-Type','application/ld+json');
	response.send(result);
	});

app.get('/api/query',function(request,response) {
	var query = request.query.query;
	if (query === undefined)
		{
			response.redirect(301, '/sparql');
		} else {
			response.redirect(301, '/sparql?query=' + query);
	}
});

app.get('/api/sparql',function(request,response) {
	var query = request.query.query;
	debug(query);
	if (query === undefined)
		{
			response.status(400).send("With GET, you must pass your SPARQL query in the 'query' parameter");
		} else {
			request.queryText = query;
			functions.sparqlQuery(request, response,functions.sendQueryResults);
	}
});

app.post('/api/query',function(request,response) {
	response.redirect(301, '/sparql');
});

app.post('/api/sparql',function(request,response) {
	var query = '';

   	request.on('data', function (data) {
     	 // Append data.
      	query += data;
  	});

   	request.on('end', function () {
      	if (query === "") {
			response.status(400).send("With POST, you must pass your SPARQL query as data.");
		} else {
			request.queryText = query;
			functions.sparqlQuery(request, response,functions.sendQueryResults);
	}
   	});

});

app.get('/api/update/*',
passport.authenticate('basic', { session: false }),
function(request,response, next) {
	next();
});

app.get('/api/:type(tables|graphs|update)/:name([\\w-]+):dot(\.)?:extension(\\w+)?',function(request,response, next) {
	var sparqlPath = "public/api/" + request.params.type;
	var sparqlFiles = fs.readdirSync(sparqlPath);
	var name = request.params.name;
	var extensions = config.get('typeByExtension.' + request.params.type);

	var foundQuery = false;
	var pathParametersIndex = 0;
	request.queryVariables = {};

	for (key in sparqlFiles) {

		//If the URL fragment matches a query file name, return the query text
		if (functions.stringBefore(sparqlFiles[key],'.') === name) {
			fs.readFile(sparqlPath + '/' + sparqlFiles[key],'utf8', function (err, data) {
	  			if (err) {throw err} else {request.queryText = data};

	  			for (key in request.query) {
	  				if (key.substring(0,1) === '$') {
	  					var variableName = '?' + key.substring(1,key.length + 1);
	  					request.queryVariables[variableName] = request.query[key];
	  				}
	  			}
	  			if (request.params.extension) {
					functions.checkExtension(request,response,extensions,functions.sparqlQuery);
	  			} else {
	  				if (request.headers.accept && request.headers.accept != "*/*") {
	  					functions.checkAcceptContentType(request,response,extensions,functions.sparqlQuery);
	  				} else {
	  					request.headers.accept = config.get('app.defaultAccept.' + request.params.type);
	  					functions.sparqlQuery(request, response,functions.sendQueryResults);
	  				}
	  			}
			});
			foundQuery = true;
		}
	};
	//Otherwise, return 404
	if (foundQuery === false) {
		response.status(404).send(request.params.type + "/" + request.params.name + ': This query does not exist.\n');
	}
});

app.put('/api/:type(tables|graphs)/:name([\\w-]+)',
passport.authenticate('basic', { session: false }),
function(request,response) {
	var sparqlPath = "public/api/" + request.params.type;
	var name = request.params.name;
	var filepath = sparqlPath + '/' + name + '.rq';
	var query = '';
	var fileExists = false;
	var publicPort = "";
	var queryUrl = "";

	request.on('data', function (data) {
     	 // Append data.
      	query += data;
  	});

  	request.on('end', function () {
      	if (query === undefined) {
			response.status(400)
			.send("You must pass your SPARQL query as data to create or modify a query.\n")
		} else if (query.length > config.get('app.maxQueryLength')) {
			response.status(413)
			.send("Query text over " + config.get('app.maxQueryLength') + " bytes is not allowed.\n")
		} else {
			fs.stat(filepath,function(err, stats){
					if (!err) {
						fileExists = true;
					}
				});

			// Test the POSTed query
			var testUrl = "http://localhost:" + request.socket.localPort + "/api/sparql?query=" + encodeURIComponent(query);
			http.get(testUrl, (res) => {
				var result = "";
				res.on('data', (data) => {
					result += data;
				});
				res.on('end', () => {
				    if (res.statusCode >= 200 && res.statusCode < 300) {
						fs.writeFile(filepath,query,'utf8', function (err) {
							if (err) {
								debug(err);
								response.status(500).send("There was an error saving the query.\n")
							} else {
								publicPort = functions.getPublicPort();
								queryUrl = config.get('app.public.scheme') + "://" + config.get('app.public.hostname')
								+ publicPort + "/api/" + request.params.type + "/" + name;
								if (fileExists === true) {
									response.status(200)
									.send(queryUrl + "\nwas successfully tested and updated.\n\n" + query)
								} else {
									response.status(201)
									.send(queryUrl + "\nwas successfully tested and created.\n\n" + query)
								}
							}
						});
					} else {
						var errorText = "There was an error testing the query (HTTP code "
							+ res.statusCode + "):.\n" + result + "\n\nYour query:\n" + query;
						debug(errorText);
						response.status(400).send(errorText);
					}
				});
	   		});	//end of http.get
		} //end of else
}); //end of request.on
});

app.delete('/api/:type(tables|graphs)/:name([\\w-]+)',
passport.authenticate('basic', { session: false }),
function(request,response) {
	var sparqlPath = "public/api/" + request.params.type;
	var name = request.params.name;
	var filepath = sparqlPath + '/' + name + '.rq';

	fs.stat(filepath,function(err, stats){
		if (err) {
			response.status(404).send(name + ": This query doesn't exist.\n")
		} else {
			fs.unlink(filepath, function (err) {
				if (err) {
					debug(err);
					response.status(500).send(name + ": There was an error deleting the query.\n" + err)
				} else {
					response.status(200).send(name + ": The query was deleted.\n")
				}
			});
		}
	});
});

app.post('/api/:type(tables|graphs)/:name([\\w-]+)',function(request,response) {
	response.status(405).send("Please use PUT method to create and update queries.");
});

app.get('/api/:type(tables|graphs)',function(request,response) {
	var dirPath = "public/api/" + request.params.type;
	var result = functions.getHydraTemplate("Collection",request.path);
	var siteRootUrl = functions.getSiteRootUrl();
	var queryName = "";
	var query = {};
	var sendList = function(err,files) {
		if (err) {
			response.status(500).send("Something went wrong when listing the content of the folder.");
		} else {
			for (file of files) {
				queryName = functions.stringBefore(file,'.');
				query = {
					"@id" : siteRootUrl + request.path + queryName,
					"@type" : "Query",
					"label" : queryName
				}
				result.members.push(query);
			}
			result = JSON.stringify(result,null,'\t');
			response.set('Content-Type', "application/ld+json");
			response.send(result);
		}
	};
	fs.readdir(dirPath,sendList);
});

app.post('/api', function(request,response) {
	if (request.get('Content-Type') === "application/coffee-pot-command") {
		response.sendStatus(418).end();
	} else {
		response.sendStatus(405).end();
	}
});

}
