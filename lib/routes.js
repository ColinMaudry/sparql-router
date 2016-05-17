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

app.post('/api', function(request,response) {
	if (request.get('Content-Type') === "application/coffee-pot-command") {
		response.sendStatus(418).end();
	} else {
		response.sendStatus(405).end();
	}
});

}
