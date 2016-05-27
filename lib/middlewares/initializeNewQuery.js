var config = require('config');

module.exports  = function(request,response,next) {
  var name = request.params.name;
  var contentType = request.headers["Content-Type"];
  var type = request.savedparams.type;
  var query = "";
  request.sparqlQuery = {};

  if (request.body.query && request.body.endpoint) {
          if (request.body.query.length > config.get('app.maxQueryLength')) {
            response.status(413)
            .send("Query text over " + config.get('app.maxQueryLength') + " bytes is not allowed.\n")
          } else {
                request.sparqlQuery = request.body;
                next();
          } //end of else
  } else if (request.query.query && request.query.endpoint) {
          query = request.query.query;
          if (query.length > config.get('app.maxQueryLength')) {
            response.status(413)
            .send("Query text over " + config.get('app.maxQueryLength') + " bytes is not allowed.\n")
          } else {

                request.sparqlQuery = request.query;
                next();
          } //end of else
  }
  else {
    var message = "You must pass your SPARQL query either as a JSON object, with 'Content-Type: application/json' header:\n\n"
    + "Example: {\"query\": \"select * where {?s ?p ?o} limit 10\", \"endpoint\":\"http://somedomain.net/sparql\"}\n\n"
    + "or as URL encoded parameters:\n\n"
    + "Example: " + siteRootUrl + "/api/" + type + "/" + name + "?query=" + encodeURIComponent("?select * where {?s ?p ?o} limit 10")
    + "&endpoint=" + encodeURIComponent("http://somedomain.net/sparql") + "\n";
    response.status(400)
    .send(message)
  }
}
