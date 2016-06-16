var Strategy = require('passport-http').BasicStrategy;
var functions = require('./../functions');
var passport = require('passport');
var express = require('express');
var config = require('config');
var debug = require('debug')('routes');
var http = require('http');
var fs = require('fs');

var initializeNewQuery = require('./../middlewares/initializeNewQuery');
var authenticate = require ('./../middlewares/authenticate');


var cannedQueries = express.Router();

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

cannedQueries.route('/')
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

cannedQueries.route('/:name([\\w-]+):dot(\.)?:extension(\\w+)?')
	.all(function (request,response,next) {
    debug(request.url + " .all");
		var type = request.savedparams.type;
		var name = request.params.name ;
		request.sparqlFilePath = './public/api/' + type +
														'/' + name + '.rq';
    request.sparqlQuery = {};

		//If the URL fragment matches a query file name, go on with the request
		fs.stat(request.sparqlFilePath,function(err, stats){
			if (err && request.method !== "PUT") {
				response.status(404).send(type + "/" + name + ': This query does not exist.\n');
			} else if (err && request.method === "PUT") {
				next();
			}
			else {
				request.fileExists = true;
        functions.getQueryMetadata(request, next);
        }
		});
	})
	.get(function(request,response) {
    debug(request.url + " .get");
		var type = request.savedparams.type;
		var name = request.params.name;
		var extensions = config.get('app.typeByExtension.' + type);
		var filepath = request.sparqlFilePath;
		var urlParams = request.query;
		request.queryVariables = {};

		for (key in urlParams) {
			if (key.substring(0,1) === '$') {
				var variableName = '?' + key.substring(1,key.length + 1);
				request.queryVariables[variableName] = urlParams[key];
			}
		}
		functions.initializeQuery(request,response,functions.sparqlQuery);
	});

	cannedQueries.route('/:name([\\w-]+)')
		.put(authenticate,passport.authenticate('basic', { session: false }),initializeNewQuery,
		function(request,response) {
      debug(request.url + " .put");
      functions.testQuery(request,response,functions.createUpdateQuery);

    })
		.post(function (request,response,next) {
      debug(request.url + " .post");
			var type = request.savedparams.type;
			var name = request.params.name;
			var urlParams = request.query;
			var body = request.body;
			var rawVariables = {};
			request.queryVariables = {};

			if (Object.getOwnPropertyNames(body).length > 0) {
				rawVariables = body ;
			} else {
				rawVariables = urlParams;
			}
			for (key in rawVariables) {
				if (key.substring(0,1) === '$') {
					var variableName = '?' + key.substring(1,key.length + 1);
					request.queryVariables[variableName] = rawVariables[key];
				}
			}
			functions.initializeQuery(request,response,functions.sparqlQuery);

		})
		.delete(passport.authenticate('basic', { session: false }),
		function(request,response) {
      debug(request.url + " .delete");
      functions.deleteQuery(request,response);
		});

		module.exports = cannedQueries;
