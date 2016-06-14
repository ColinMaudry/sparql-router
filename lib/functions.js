var fs = require('fs');
var nodeUrl = require('url');
var http = require('http');
var https= require('https');
var debug = require('debug')('functions');
var config = require('config');
var sparqljs = require('sparqljs');

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


module.exports.stringBefore = function(str, sep) {
 var i = str.indexOf(sep);

 if(i > 0)
  return  str.slice(0, i);
 else
  return str;
};

module.exports.capitalizeFirst = function(str) {
	return str.substring(0, 1).toUpperCase() + str.substring(1);
}

module.exports.sparqlQuery = function(request,response, callback) {
  debug(request.url + " sparqlQuery");

	var result = "";
	var scheme = {};
 	if (request.queryVariables && Object.keys(request.queryVariables).length > 0) {
 		request = module.exports.populateCustomQueryVariables(request);
 	}

	if (config.get('endpoints.system.scheme') == 'https') {scheme = https} else {scheme = http};
	var options = module.exports.getHttpOptions(request);
	if (request.get('accept') && !options.headers['accept']) options.headers['accept'] = request.get('accept');

	var req = scheme.request(options, (res) => {
		res.setEncoding('utf8');
		res.on('data', (data) => {
			result += data;
		});
		res.on('end', () => {
			if (res.headers["content-type"]) {
				response.set('Content-Type', res.headers["content-type"]);
			}
			if (typeof callback === "function") {
				callback(res.statusCode,result,response,request);
			}
			debug('No more data in response.');
		})
	});
	req.on('error', (e) => {
		console.log('Error: problem with request: ' + e.message);
		response.status(500).send('problem with request: ' + e.message + '\n');
	});
	req.write(request.sparqlQuery.query);
	req.end();

};

module.exports.sendQueryResults = function (statusCode,result,response, request) {
	response
		.status(statusCode)
		.send(result);
};

module.exports.getHttpOptions = function(request) {
  debug(request.url + " getHttpOptions");

  var endpointConfig = {} ;
	var queryPath = "";
	var method = "";
	var auth = "";
	var body = {};
	var headers = {};

  request = module.exports.getEndpointConfig(request);

  var endpointUrl = nodeUrl.parse(request.sparqlQuery.endpoint);

	if (request.savedparams && request.savedparams.type === 'update') {
    request.sparqlQuery.query = "update=" + request.sparqlQuery.query;
		queryPath = endpointUrl.pathname;
		method = 'POST';
		headers['accept'] = "*/*";
		headers['content-type'] = "application/x-www-form-urlencoded";
		headers['content-length'] = Buffer.byteLength(request.sparqlQuery.query);
	} else {
		queryPath = endpointUrl.pathname + '?query='+ encodeURIComponent(request.sparqlQuery.query);
		method = 'GET';
	}

	var options = {
		  hostname: endpointUrl.hostname,
		  port: endpointUrl.port,
		  path: queryPath,
		  method: method,
		  headers: headers,
		  body: body,
      auth: (request.endpointConfig.auth) ? request.endpointConfig.auth : ""
	};

  debug("HTTP options: " + JSON.stringify(options,null,2));
	return options;
};

module.exports.populateCustomQueryVariables = function(request) {

	//Replaced variables are stripped from the SELECT clause
	if (request.savedparams.type == "tables") {
		//SPARQL query is turned into a JSON object
		request.sparqlQuery.query = module.exports.stripVariableFromSelectClause(request.queryVariables, request.sparqlQuery.query);
	}

	//Replace all occurences of variables name in query string
	for (var variableName in request.queryVariables) {
		//Escape special characters
		var variableNameRegex = new RegExp(variableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^\\w])","g");
		var variableValue = request.queryVariables[variableName];
		request.sparqlQuery.query = request.sparqlQuery.query.replace(variableNameRegex,variableValue + "$1");
	}
	return request;
};

module.exports.stripVariableFromSelectClause = function (queryVariables, queryText) {
	var SparqlParser =  sparqljs.Parser;
	var parser = new SparqlParser();
	var SparqlGenerator =  sparqljs.Generator;
	var generator = new SparqlGenerator();
	var queryObject = parser.parse(queryText);


	for (var variableName in queryVariables) {
		for (selectVariableIndex in queryObject.variables) {
			if (queryObject.variables[selectVariableIndex] == variableName) {
				queryObject.variables.splice(selectVariableIndex, 1);
			}

		}
	}

	var queryText = generator.stringify(queryObject);
	return queryText;
};

module.exports.getPort = function(object) {
	var port = object.port;
	if (
	port != 80 &&
	port != 443 &&
	port != ""
	) {
		return ":" + port;
	} else {
		return "";
	}
};

module.exports.checkAcceptContentType = function(request, response, extensions, callback) {
	var foundContentType = false;

	for (extension in extensions) {
		if (extensions[extension] == request.headers.accept) {
			foundContentType = true;
			break;
		}
	}
	if (foundContentType === false) {
		var statusCode = 406;
		var message = "Invalid content type in Accept header (" + request.headers.accept + ").\nThe valid content types are:\n";
		for (extension in extensions) {
			message += extensions[extension] + "\n";
		}
		module.exports.sendQueryResults(statusCode,message,response);
	} else {
		if (typeof callback === "function") {
		callback(request,response,module.exports.sendQueryResults);
		}
	}
}

module.exports.checkExtension = function(request, response, extensions, callback) {
	var foundExtension = false;

	for (extension in extensions) {
		if (extension == request.params.extension) {
			request.headers.accept = extensions[extension];
			foundExtension = true;
			break;
		}
	}
	if (foundExtension === false) {
		var statusCode = 406;
		var message = "Invalid extension (." + request.params.extension + ") for /"
		+ request.params.type + " .\nThe valid extensions for /" + request.params.type + " are:\n";
		for (extension in extensions) {
			message += "." + extension + "\n";
		}
		module.exports.sendQueryResults(statusCode,message,response);
	} else {
		if (typeof callback === "function") {
		callback(request,response,module.exports.sendQueryResults);
		}
	}
}

module.exports.getHydraTemplate = function (type,path) {
  var jsonld = {
  "@context": siteRootUrl + "/api/hydra.jsonld",
  "@type": "",
  "@id": ""
  };
  jsonld["@type"] = type;
  jsonld["@id"] = siteRootUrl + path;
  if (type === "Collection") {
    jsonld.members = [];
  }
  return jsonld;
};

module.exports.getSiteRootUrl = function () {
	var port = "";
	if (config.get("app.public.port")) {
		port = ":" + config.get("app.public.port");
	}
  return config.get("app.public.scheme")
  + "://" + config.get("app.public.hostname") + port;
};

module.exports.testQuery = function (request, response,cb) {
  debug(request.url + " testQuery");

	var query = request.sparqlQuery.query;
	var testUrl = "";
	var result = "";
  var endpoint = "";

  var request = module.exports.getEndpointConfig(request);

  endpoint = request.sparqlQuery.endpoint ;

  var scheme = (endpoint.substring(0,5) === "https") ? https : http;

  module.exports.sparqlQuery(request,response,function(statusCode,result,response,request) {
      if (statusCode < 300) {
        cb(request,response);
      } else {
        var errorText = "There was an error testing the query (HTTP code "
          + statusCode + "):.\nResult: " + result + "\n\nYour query:\n" + query;
        debug(errorText);
        response.status(400).send(errorText);
      }
  });
};

module.exports.initializeQuery = function(request,response,cb) {
  debug(request.url + " initializeQuery");

	var filepath = request.sparqlFilePath;
	var type = request.savedparams.type ;
	var extensions = config.get('typeByExtension.' + type);

	fs.readFile(filepath,'utf8', function (err, data) {
			if (err) {throw err} else {request.sparqlQuery.query = data};

			if (request.params.extension) {
			module.exports.checkExtension(request,response,extensions,cb);
			} else {
				if (request.headers.accept && request.headers.accept != "*/*") {
					module.exports.checkAcceptContentType(request,response,extensions,cb);
				} else {
					request.headers.accept = config.get('app.defaultAccept.' + type);
					cb(request, response,module.exports.sendQueryResults);
				}
			}
		});
};


module.exports.createUpdateQuery = function (request, response) {
  debug(request.url + " createUpdateQuery");

	var name = request.params.name;
	var type = request.savedparams.type;
	var body = request.body;
	request.queryUrl = siteRootUrl + "/api/" + type + "/" + name;
	var date = new Date();
	var now = date.toISOString();
  request.adminAction = (request.fileExists === true) ? "update-query" : "new-query" ;
  var sparqlQuery = request.sparqlQuery;
  var endpoint = sparqlQuery.endpoint;
  sparqlQuery.endpoint = (endpoint === defaultEndpointQuery || endpoint === defaultEndpointUpdate) ? "" : endpoint;
  var params = {
    "$modificationDate" : "\"" +  now + "\"^^xsd:dateTime",
    "$slug" : "\"" +  name + "\"",
    "$queryType" : "router:" + module.exports.capitalizeFirst(type) + "Query",
    "$endpoint" : '""',
    "$author"  : '""',
    "$name" : '""'
  };

  for (var param in sparqlQuery) {
    if (param !== "query") {
      if (sparqlQuery[param].substring(0,4) === "http") {
        params["$" + param] = "<" + sparqlQuery[param] + ">";
      } else {
        params["$" + param] = '"' + sparqlQuery[param] + '"';
      }
    }
  }

	if (request.fileExists !== true) {
    params["$query"] = "<" +  siteRootUrl + "/api/" + type + "/" + name + "#id>";
		params["$creationDate"] = "\"" +  now + "\"^^xsd:dateTime";
	}
	module.exports.sendAdminUpdate(params,request,response,module.exports.writeQueryFile);
};

module.exports.deleteQuery = function (request, response) {
	var name = request.params.name;
	var type = request.savedparams.type;
	var date = new Date();
	var now = date.toISOString();
  request.adminAction = "delete-query";

	var params = {
		"$type" : "router:" + module.exports.capitalizeFirst(type) + "Query",
		"$slug" : "\"" + name + "\""
		};
	module.exports.sendAdminUpdate(params,request,response,module.exports.deleteQueryFile);
};

module.exports.writeQueryFile = function (request,response) {
	var publicPort = "";
	fs.writeFile(request.sparqlFilePath, request.sparqlQuery.query, 'utf8', function (err) {
		if (err) {
			debug(err);
			response.status(500).send("There was an error saving the query file.\n")
		} else {
			publicPort = module.exports.getPort(config.get("app.public"));
				if (request.fileExists === true) {
					response.status(200)
					.send(request.queryUrl + "\n\nwas successfully tested and updated.\n\n" + request.sparqlQuery.query)
				} else {
					response.status(201)
					.send(request.queryUrl + "\n\nwas successfully tested and created.\n\n" + request.sparqlQuery.query)
				}
		}
	});
};

module.exports.deleteQueryFile = function (request,response) {
  queryUrl = siteRootUrl + "/api/" + request.savedparams.type + "/" + request.params.name;
	fs.unlink(request.sparqlFilePath, function (err) {
		if (err) {
			debug(err);
			response.status(500).send("There was an error deleting the query file.\n")
		} else {
			response.status(200)
			.send(queryUrl + "\nwas successfully deleted.\n\n")
		}
	});
};

module.exports.sendAdminUpdate = function (params,request,response,cb) {
  debug(request.url + " sendAdminUpdate");

	var result = "";
	var appConfig = config.get('app');

	var options = {
		  hostname: "localhost",
			port: request.socket.localPort,
		  path: "/api/update/" + request.adminAction,
		  method: "POST",
		  headers: {
				"Content-Type":"application/json"
			}
	};
	if (config.get('endpoints.system.scheme') == 'https') {scheme = https} else {scheme = http};
	var req = scheme.request(options, (res) => {
			res.setEncoding('utf8');
			res.on('data', (data) => {
				result += data;
			});
			res.on('end', () => {
					if (res.statusCode < 300) {
						cb(request,response);
					} else {
						throw new Error ("There was an error (" + res.statusCode + ") writing metadata: " + result + ".\n");
					}
			})
		});
		req.on('error', (e) => {
				throw new Error ("There was an error writing metadata:" + e.message + ".\n");
		});
		req.write(JSON.stringify(params));
		req.end();
};

module.exports.getQueryMetadata = function(request, next) {
  debug(request.url + " getQueryMetadata");

  var name = request.params.name ;
  request.queryMetadata = "";

  if (name === "query-metadata") {
    request.queryMetadata = {
      "@id": "uri:sparql-router:system:graphs:query-metadata",
      "dct:identifier" : "query-metadata",
      "@type" : ["router:GraphsQuery", "router:SystemQuery"],
      "endpoint" : systemEndpointQuery
    }
    next();
  } else {
      var queryType = encodeURIComponent("router:" + module.exports.capitalizeFirst(request.savedparams.type) + "Query");
      var options = {
        method: "GET",
        hostname: "localhost",
        port: request.socket.localPort,
        path: "/api/graphs/query-metadata.jsonld?$queryType=" + queryType
        + "&$name=%22" + request.params.name + "%22"
      };
      var url = "http://" + options.hostname + ":" + request.socket.localPort + options.path;

      var req = http.get(url, (res) => {
          var result = "";
          res.setEncoding('utf8');
          res.on('data', (data) => {
            result += data;
          });
          res.on('end',function() {
            debug("raw metadata:" + result);
            request.queryMetadata = JSON.parse(result);

            next();
          });
      });
      req.on('error', (e) => {
        console.log('Error: problem getting query metadata: ' + e.message);
        response.status(500).send('problem with request: ' + e.message + '\n');
      });
      req.end();
    }
  };

module.exports.getEndpointConfig = function(request) {
  debug(request.url + " getEndpointConfig");

  var endpointConfig = {};
  var queryMetadata = request.queryMetadata;
  var queryEndpoint = (queryMetadata) ? queryMetadata.endpoint : undefined;

  var addAuth = function (endpointConfig) {
    if (endpointConfig.user !== "") {
      endpointConfig.auth = endpointConfig.user + ":" + endpointConfig.password;
    }
    request.endpointConfig = endpointConfig;
  };

  if (queryEndpoint === undefined || queryEndpoint.length === 0) {
    endpointConfig = config.get('endpoints.default');
    debug("Endpoint configuration: " + JSON.stringify(endpointConfig,null, 2));
    request.sparqlQuery.endpoint = (request.savedparams && request.savedparams.type === "update") ? defaultEndpointUpdate : defaultEndpointQuery ;
    addAuth(endpointConfig);
  }  else {
      debug("Query metadata: " + JSON.stringify(request.queryMetadata,null, 2));
      request.sparqlQuery.endpoint = request.queryMetadata.endpoint ;
      if (request.queryMetadata["@type"].indexOf("router:SystemQuery") !== -1) {
        endpointConfig = config.get('endpoints.system');
      }
      debug("Endpoint configuration: " + JSON.stringify(endpointConfig,null, 2));
      addAuth(endpointConfig);
  }

  return request;

};
