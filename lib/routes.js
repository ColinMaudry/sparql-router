var debug = require('debug');
var fs = require('fs');
var passport = require('passport');
var config = require('config');

//My functions
var functions = require('./functions');

module.exports = function(app) {

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
			functions.getQuery(request, response, query);	
	}
});

app.get('/sparql',function(request,response) {
	var query = request.query.query;
	debug(query);
	if (query == undefined) 
		{
			response.status(400).send("With GET, you must pass your SPARQL query in the 'query' parameter");
		} else {
			functions.getQuery(request, response, query);	
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
			functions.getQuery(request, response, query);	
	}
   	});
	
});

app.get('/:type(tables|graphs)/:name([\\w-]+):dot(\.)?:extension(\\w+)?',function(request,response) {
	var sparqlPath = "public/" + request.params.type;
	var sparqlFiles = fs.readdirSync(sparqlPath);
	var name = request.params.name;
	var foundQuery = false;

	for (key in sparqlFiles) {

		//If the URL fragment matches a query file name, return the query text
		if (functions.stringBefore(sparqlFiles[key],'.') == name) {
			fs.readFile(sparqlPath + '/' + sparqlFiles[key],'utf8', function (err, data) {
	  			if (err) throw err;
	  			if (request.params.extension) {
					var foundExtension = false;
					for (var extension in config.get('typeByExtension.' + request.params.type)) {
						if (extension == request.params.extension) {
							request.headers.accept = config.get('typeByExtension.' + request.params.type + '.' + extension);
							foundExtension = true;
						}
					}
					if (foundExtension == false) {
						var extensions = '';
						for (var i = 0; config.get('typeByExtension.' + request.params.type).length; i++) {
						extensions += config.get('typeByExtension.' + request.params.type) + " ";
					}
						response.status(400).send(request.path + ': extension "'
							+ request.params.extension + '" not valid for ' + [request.params.type] + '. Authorized extensions: '
							+ extensions + '\n');
					} else {
						functions.getQuery(request, response, data);
					}
	  			} else {
	  				functions.getQuery(request, response, data);
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

app.post('/:type(tables|graphs)/:name([\\w-]+)',
passport.authenticate('basic', { session: false }),
function(request,response) {
	var sparqlPath = "public/" + request.params.type;
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
			.send("You must pass your SPARQL query as data to create or modify a query.\n");
		} else {
			fs.stat(filepath,function(err, stats){
				if (!err) {
					fileExists = true;
				}
			});
			fs.writeFile(filepath,query,'utf8', function (err) {
				if (err) {
					console.log(err);
					response.status(500).send("There was an error writing the query.\n");
				} else {
					if (fileExists === true) {
						response.status(200).send("The query was updated.\n");
					} else {
						response.status(201).send("The query was created.\n");
					}
				}
			});	
	}
   	});	
});


app.delete('/:type(tables|graphs)/:name([\\w-]+)',
passport.authenticate('basic', { session: false }),
function(request,response) {
	var sparqlPath = "public/" + request.params.type;
	var name = request.params.name;
	var filepath = sparqlPath + '/' + name + '.rq';

	fs.stat(filepath,function(err, stats){
		if (err) {
			response.status(404).send(name + ": This query doesn't exist.\n");
		} else {
			fs.unlink(filepath, function (err) {
				if (err) {
					console.log(err);
					response.status(500).send(name + ": There was an error deleting the query.\n");
				} else {
					response.status(200).send(name + ": The query was deleted.\n");
				}
			});
		}
	});
});

app.get('/',function(request,response) {
	response.send("Hello");
});

}