var fs = require('fs');
var http = require('http');
var https= require('https');
var debug = require('debug');
var config = require('config');


module.exports.stringBefore = function(str, sep) {
 var i = str.indexOf(sep);

 if(i > 0)
  return  str.slice(0, i);
 else
  return str;     
}


module.exports.timeDiff = function(t1, t2) {
    var s = t2[0] - t1[0];
    var ms = t2[1] - t1[1];
    return (s*1e9 + ms)/1e6 + " ms";
}

module.exports.sparqlQuery = function(request,response) {
	var result = "";
	var scheme = {};
	if (config.get('endpoint.scheme') == 'https') {scheme = https} else {scheme = http}
	
	var options = module.exports.getHttpOptions(request);

	if (request.get('accept')) options.headers['Accept'] = request.get('accept');

	debug("Accept: " + request.get('accept'));

	//console.log(options);
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
			};
			response
			.status(res.statusCode)
			.send(result);
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

module.exports.getHttpOptions = function(request) {
	var queryType = request.params.type;
	var queryPath = "";
	var method = "";
	var headers = {};
	if (queryType == 'update') {
		queryPath = config.get('endpoint.updatePath');
		method = 'POST'
		headers['content-type'] = "application/sparql-update";
		headers['content-length'] = Buffer.byteLength(request.queryText);
	} else {
		queryPath = config.get('endpoint.queryPath') + '?'+ config.get('endpoint.queryParameterName') + '=' + encodeURIComponent(request.queryText);
		method = 'GET';
	}
		
	var options = {
		  hostname: config.get('endpoint.hostname'),
		  port: config.get('endpoint.port'),
		  path: queryPath,
		  method: method,
		  headers: headers
	};
	return options;
};
