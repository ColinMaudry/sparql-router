var functions = require('./../functions');
var express = require('express');
var debug = require('debug');

var sparql = express.Router();


sparql.route('/')
.get(function(request,response) {
	var query = request.query.query;
	debug(query);
	if (query === undefined)
		{
			response.status(400).send("With GET, you must pass your SPARQL query in the 'query' parameter");
		} else {
			request.queryText = query;
			functions.sparqlQuery(request, response,functions.sendQueryResults);
	}
})
.post(function(request,response) {
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

module.exports = sparql;
