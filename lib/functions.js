var fs = require('fs');
var http = require('http');
var https= require('https');
var debug = require('debug');
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

module.exports.timeDiff = function(t1, t2) {
    var s = t2[0] - t1[0];
    var ms = t2[1] - t1[1];
    return (s*1e9 + ms)/1e6 + " ms";
};

module.exports.sparqlQuery = function(request,response, callback) {
	var result = "";
	var scheme = {};

 	if (request.queryVariables && Object.keys(request.queryVariables).length > 0) {
 		request = module.exports.populateCustomQueryVariables(request);
 	}

	if (config.get('endpoint.scheme') == 'https') {scheme = https} else {scheme = http};
	var options = module.exports.getHttpOptions(request);
	if (request.get('accept') && !options.headers['accept']) options.headers['accept'] = request.get('accept');

	debug("Accept: " + request.get('accept'));

	t1 = process.hrtime();

	var req = scheme.request(options, (res) => {
	  	debug(`HEADERS: ${JSON.stringify(res.headers)}`);
		res.setEncoding('utf8');
		res.on('data', (data) => {
			result += data;
		});
		res.on('end', () => {
			t2 = process.hrtime();
			if (res.headers["content-type"]) {
				response.set('Content-Type', res.headers["content-type"]);
			}
			if (typeof callback === "function") {
				callback(res.statusCode,result,response);
			}

			debug("Query time: " + module.exports.timeDiff(t1,t2));
			debug('No more data in response.');
		})
	});
	req.on('error', (e) => {
		console.log('Error: problem with request: ' + e.message);
		response.status(500).send('problem with request: ' + e.message + '\n');
	});
	req.write(request.queryText);
	req.end();

};

module.exports.sendQueryResults = function (statusCode,result,response) {
	response
		.status(statusCode)
		.send(result);
};

module.exports.getHttpOptions = function(request) {
	var queryPath = "";
	var method = "";
	var auth = "";
	var body = {};
	var headers = {};
	var endpointConfig = config.get('endpoint');
	if (request.savedparams && request.savedparams.type === 'update') {
		queryPath = endpointConfig.updatePath + '?'+ endpointConfig.updateParameterName + '=' + encodeURIComponent(request.queryText);
		method = 'POST';
		headers['accept'] = "*";
		headers['content-type'] = "application/x-www-form-urlencoded";
		headers['content-length'] = Buffer.byteLength(request.queryText);
	} else {
		queryPath = endpointConfig.queryPath + '?'+ endpointConfig.queryParameterName + '=' + encodeURIComponent(request.queryText);
		method = 'GET';
	}

	var options = {
		  hostname: endpointConfig.hostname,
		  port: endpointConfig.port,
		  path: queryPath,
		  method: method,
		  headers: headers,
		  body: body
	};
	if (endpointConfig.user != "") {
		options.auth = endpointConfig.user + ":" + endpointConfig.password;
	}
	return options;
};

module.exports.populateCustomQueryVariables = function(request) {

	//Replaced variables are stripped from the SELECT clause
	if (request.savedparams.type == "tables") {
		//SPARQL query is turned into a JSON object
		request.queryText = module.exports.stripVariableFromSelectClause(request.queryVariables, request.queryText);
	}

	//Replace all occurences of variables name in query string
	for (var variableName in request.queryVariables) {
		//Escape special characters
		var variableNameRegex = new RegExp(variableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^\\w])","g");
		var variableValue = request.queryVariables[variableName];
		request.queryText = request.queryText.replace(variableNameRegex,variableValue + "$1");
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

	queryText = generator.stringify(queryObject);
	return queryText;
};

module.exports.getPublicPort = function() {
	var publicPort = config.get('app.public.port');
	if (
	publicPort != 80 &&
	publicPort != 443 &&
	publicPort != ""
	) {
		return ":" + publicPort;
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
  var siteRootUrl = module.exports.getSiteRootUrl();
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
	var query = request.sparqlQuery;
	var testUrl = "";
	var result = "";

	// Test the POSTed query
	testUrl = "http://localhost:" + request.socket.localPort + "/api/sparql?query=" + encodeURIComponent(query);
	http.get(testUrl, (testRes) => {
		testRes.on('data', (data) => {
			result += data;
		});
		testRes.on('end', () => {
				if (testRes.statusCode >= 200 && testRes.statusCode < 300) {
					cb(request,response);
			} else {
				var errorText = "There was an error testing the query (HTTP code "
					+ testRes.statusCode + "):.\n" + result + "\n\nYour query:\n" + query;
				debug(errorText);
				response.status(400).send(errorText);
			}
		});
		});	//end of http.get
};

module.exports.initializeQuery = function(request,response,cb) {
	var filepath = request.sparqlFilePath;
	var type = request.savedparams.type ;
	var extensions = config.get('typeByExtension.' + type);

	fs.readFile(filepath,'utf8', function (err, data) {
			if (err) {throw err} else {request.queryText = data};

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
	var query = request.sparqlQuery;
	var name = request.params.name;
	var publicPort = "";
	var queryUrl = "";

	fs.writeFile(request.sparqlFilePath,query,'utf8', function (err) {
		if (err) {
			debug(err);
			response.status(500).send("There was an error saving the query.\n")
		} else {
			publicPort = module.exports.getPublicPort();
			queryUrl = config.get('app.public.scheme') + "://" + config.get('app.public.hostname')
			+ publicPort + "/api/" + request.savedparams.type + "/" + name;

			if (request.fileExists === true) {
				response.status(200)
				.send(queryUrl + "\nwas successfully tested and updated.\n\n" + query)
			} else {
				response.status(201)
				.send(queryUrl + "\nwas successfully tested and created.\n\n" + query)
			}
		}
	});
};

module.exports.sendUpdateQuery = function (name,params) {

};
