var functions = require('./../functions');
var express = require('express');
var debug = require('debug');

var initializeNewQuery = require('./../middlewares/initializeNewQuery');

var sparql = express.Router();


sparql.route('/')
.get(initializeNewQuery, function(request,response) {
	var query = request.query.query;
	debug(query);
	if (query === undefined)
		{
			response.status(400).send("With GET, you must pass your SPARQL query as URL parameters (?query=...).");
		} else {
      request.sparqlQuery = {};
			request.sparqlQuery.query = query;
			functions.sparqlQuery(request, response,functions.sendQueryResults);
	}
})
.post(initializeNewQuery, function(request,response) {
		var query = '';
   	request.on('data', function (data) {
     	 // Append data.
      	query += data;
  	});

   	request.on('end', function () {
      	if (query === "") {
			response.status(400).send("With POST, you must pass your SPARQL query as data.");
		} else {
      request.sparqlQuery = {};
			request.sparqlQuery.query = query;
			functions.sparqlQuery(request, response,functions.sendQueryResults);
	}
   	});

});

module.exports = sparql;
