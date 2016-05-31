var functions = require('./../functions');
var bodyParser = require('body-parser');
var express = require('express');
var debug = require('debug')('routes');


var initializeNewQuery = require('./../middlewares/initializeNewQuery');

var parseJson = bodyParser.json({ extended: false });

var sparql = express.Router();


sparql.route('/')
.get(initializeNewQuery, function(request,response) {
      debug(request.url + " .get");
			functions.sparqlQuery(request, response,functions.sendQueryResults);
})
.post(parseJson, initializeNewQuery, function(request,response) {
      debug(request.url + " .post");
			functions.sparqlQuery(request, response,functions.sendQueryResults);
})
.all(function(request,response) {
  debug(request.url + " .all");
  response.status(405).send("This endpoint only accepts GET and POST requests.");
});

module.exports = sparql;
