var Strategy = require('passport-http').BasicStrategy;
var functions = require('./../functions');
var passport = require('passport');
var express = require('express');
var config = require('config');
var debug = require('debug');
var http = require('http');
var fs = require('fs');

var tablesGraphs = express.Router();

passport.use(new Strategy(
  function(username, password, cb) {
    if (
      config.get("app.authentication") === false ||
      (config.get("app.authentication") === true &&
      username === config.get("app.user") &&
      password === config.get("app.password"))
      )
       {
    	return cb(null, username);
    } else {
    	return cb(null, false);
    }
    })
  );

tablesGraphs.route('/')
	.get(function(request,response) {
		var dirPath = "public/api/" + request.savedparams.type;
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

tablesGraphs.route('/:name([\\w-]+):dot(\.)?:extension(\\w+)?')
	.get(function(request,response) {
		var sparqlPath = "public/api/" + request.savedparams.type;
		var sparqlFiles = fs.readdirSync(sparqlPath);
		var type = request.savedparams.type;
		var name = request.params.name;
		var extensions = config.get('typeByExtension.' + type);

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
								request.headers.accept = config.get('app.defaultAccept.' + type);
								functions.sparqlQuery(request, response,functions.sendQueryResults);
							}
						}
				});
				foundQuery = true;
			}
		};
		//Otherwise, return 404
		if (foundQuery === false) {
			response.status(404).send(type + "/" + request.params.name + ': This query does not exist.\n');
		}
	});

	tablesGraphs.route('/:name([\\w-]+)')
		.post(function(request,response) {
		response.status(405).send("Please use PUT method to create and update queries.");
	})
		.put(passport.authenticate('basic', { session: false }),
		function(request,response) {
			var sparqlPath = "public/api/" + request.savedparams.type;
			var name = request.params.name;
			var query = "";
			request.filepath = sparqlPath + '/' + name + '.rq';

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
					fs.stat(request.filepath,function(err, stats){
							if (!err) {
								request.fileExists = true;
							}
							request.sparqlQuery = query;
							functions.testQuery(request,response,functions.createUpdateQuery);
						});
				} //end of else
		}); //end of request.on
		})
		.delete(passport.authenticate('basic', { session: false }),
		function(request,response) {
			var sparqlPath = "public/api/" + request.savedparams.type;
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
		});;

		module.exports = tablesGraphs;
