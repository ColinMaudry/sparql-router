var fs = require('fs');
var http = require('http');
var debug = require('debug');


//Load configuration file
eval(fs.readFileSync('config.js', encoding="utf8"));

module.exports.stringBefore = function(str, sep) {
 var i = str.indexOf(sep);

 if(i > 0)
  return  str.slice(0, i);
 else
  return str;     
}

module.exports.getQuery = function(request,response, data) {
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

