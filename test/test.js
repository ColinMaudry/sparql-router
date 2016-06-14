var request = require('supertest');
var config = require('config');
var app = require('./../app');
var fs = require('fs');

console.log("Environment: " + process.env.NODE_ENV + " (config/" + process.env.NODE_ENV + ".json)");

//
// Basic testing
//

describe('Basic tests', function() {

	it('API home page runs and /api returns 200 and JSON', function(done) {
		request(app)
			.get('/api')
			.expect('Content-Type',/json/)
			.expect(200, done)
	});
	it('Root path (/) returns HTML Web app.', function(done) {
		request(app)
			.get('/')
      .expect('Content-Type',/html/)
			.expect(200, done)
	});
	it('API home page runs and /api returns 200 and HTML to a browser', function(done) {
		request(app)
			.get('/api/')
			.set('Accept', 'text/html')
			.expect('Content-Type',/html/)
			.expect(200, done)
	});
	it('The configured endpoint returns 200 and JSON SPARQL results', function(done) {
		request(app)
			.get('/api/tables/test')
			.set('Accept', 'application/sparql-results+json')
			.expect(200)
			.expect('Content-Type', /json/, done);
	});
	it('The configured endpoint returns 200 and CSV results', function(done) {
		request(app)
			.get('/api/tables/test')
			.set('Accept', 'text/csv')
			.expect(200)
			.expect('Content-Type', /csv/, done);
	});
	it('The configured endpoint has data loaded', function(done) {
		request(app)
			.get('/api/tables/test')
			.set('Accept', 'application/sparql-results+json')
			.expect(200)
			.expect(function(response) {
				if (response.body.results.bindings.length > 0) {
					return "Response has results."; }
				else {
					throw new Error("No result from the endpoint.");
				}
			})
			.end(function (error) {
			if (error) return done(error);
			done();
			});
	});
	it('POST typically designed to brew coffee is ineffective.', function(done) {
		request(app)
			.post('/api')
			.set('Content-Type','application/coffee-pot-command')
			.expect(418, done)
	});
});

//
// Canned query results
//

describe('Using canned queries', function() {
	it('/random/random returns 404', function(done) {
		request(app)
			.get('/api/random/random')
			.expect(404, done);
	});
	it('/api/tables/random returns 404', function(done) {
		request(app)
			.get('/api/tables/random')
			.expect(404, done);
	});
	it('/api/tables/test.csv with Accept:application/json returns text/csv results', function(done) {
		request(app)
			.get('/api/tables/test.csv')
			.set('Accept','application/json')
			.expect('Content-Type', /text\/csv/)
			.expect(200, done);
	});
	it('/api/tables/test.csv returns text/csv results', function(done) {
		request(app)
			.get('/api/tables/test.csv')
			.expect('Content-Type', /text\/csv/)
			.expect(200, done);
	});
	it('/api/graphs/test.rdf returns application/rdf+xml or XML results.', function(done) {
		request(app)
			.get('/api/graphs/test.rdf')
			.expect('Content-Type', /(\/xml|rdf\+xml)/)
			.expect(200, done);
	});
	it('/api/tables/test with Accept:text/csv returns text/csv.', function(done) {
		request(app)
			.get('/api/tables/test')
			.set('Accept', 'text/csv')
			.expect('Content-Type', /text\/csv/)
			.expect(200, done);
	});
	it('/api/tables/test with Accept:random/type returns error 406.', function(done) {
		request(app)
			.get('/api/tables/test')
			.set('Accept', 'random/type')
			.expect(406, done);
	});
	it('/api/tables/test.xxx returns error 406', function(done) {
		request(app)
			.get('/api/tables/test.xxx')
			.expect(406, done);
	});
	it('POST /api/update/test3 (insert data) returns 200', function(done) {
		request(app)
			.post('/api/update/test3')
			.expect(200, done);
	});
	it('GET /api/update/test4  (delete data) returns 200', function(done) {
		request(app)
			.get('/api/update/test4')
			.expect(200, done);
	});
	it('GET /api/ask/test returns 200 and true', function(done) {
		request(app)
			.get('/api/ask/test')
			.expect(function(response) {
				if (response.body.boolean === true) {return "Query worked."	}
				else {throw new Error("Query didn't return true.");}
			})
			.expect(200, done);
	});
	it('GET /api/ask/test3 returns 200 and false', function(done) {
		request(app)
			.get('/api/ask/test3')
			.expect(function(response) {
				if (response.body.boolean === false) {return "Query worked."	}
				else {throw new Error("Query didn't return false.");}
			})
			.expect(200, done);
	});
});

//
// Hydra API vocabulary
//
describe('Describing API resources with Hydra vocabulary', function() {
	it('The API documentation is available and with the right @id.', function(done) {
		request(app)
			.get('/api/hydra.jsonld')
			.expect(function(response) {
				if (response.body["@id"].indexOf(config.get('app.public.hostname'))) {
					return "The context @id is good."; }
				else {
					throw new Error("No queries listed.");
				}
			})
			.expect('Content-Type',/application\/ld\+json/)
			.expect(200, done);
	});
	it('The Hydra entry point returns JSON-LD.', function(done) {
		request(app)
			.get('/api')
			.accept('application/ld+json')
			.expect(function(response) {
				if (response.body["@type"] = "EntryPoint") {
					return "The entry point has the right type."; }
				else {
					throw new Error("Not an entry point.");
				}
			})
			.expect('Content-Type',/application\/ld\+json/)
			.expect(200, done)
	});
	it('Get the list of /api/tables in JSON-LD format.', function(done) {
		request(app)
			.get('/api/tables')
			.expect(function(response) {
				if (response.body.members.length > 0) {
					return "The query collection has members."; }
				else {
					throw new Error("No queries listed.");
				}
			})
			.expect('Content-Type',/application\/ld\+json/)
			.expect(200, done)
	});
});

//
// GET results and populating variables
//

describe('GET results from canned queries, populating query variables', function() {
  it('/api/tables/test?$o="dgfr" returns 200 and single result', function(done) {
		request(app)
			.get('/api/tables/test?$o="dgfr"')
      .set('Accept', 'application/sparql-results+json')
			.expect(function(response) {
				if (response.body.results.bindings.length == 1 &&
					response.body.results.bindings[0].s.value == "http://colin.maudry.com/ontologies/dgfr#" &&
					response.body.results.bindings[0].p.value == "http://purl.org/vocab/vann/preferredNamespacePrefix") {
					return "Variable successfully replaced."; }
				else {
					throw new Error("Variable not applied successfully.");
				}
			})
			.expect(200, done);
	});
	it('POST /api/tables/test with variable (JSON) returns 200', function(done) {
		request(app)
			.post('/api/tables/test')
			.set('Content-Type','application/json')
      .set('Accept', 'application/sparql-results+json')
			.send({"$o" : '"dgfr"'})
      .expect(function(response) {
        if (response.body.results.bindings.length == 1 &&
          response.body.results.bindings[0].s.value == "http://colin.maudry.com/ontologies/dgfr#" &&
          response.body.results.bindings[0].p.value == "http://purl.org/vocab/vann/preferredNamespacePrefix") {
          return "Variable successfully replaced."; }
        else {
          throw new Error("Variable not applied successfully.");
        }
      })
      .expect(200, done);
	});
	it('POST /api/update/test with variable (JSON) returns 200', function(done) {
		request(app)
			.post('/api/update/test')
			.set('Content-Type','application/json')
			.send({"$prefix" : '"datafr"'})
			.expect(200, done);
	});
	it('POST /api/update/test2 with variable (URL) returns 200', function(done) {
		request(app)
			.post('/api/update/test2?$prefix="datafr"')
			.expect(200, done);
	});
	it('/api/tables/test2?$under_score="dgfr" returns 200 and single result', function(done) {
		request(app)
			.get('/api/tables/test2?$under_score="dgfr"')
			.expect(function(response) {
				if (response.body.results.bindings.length == 1 &&
					response.body.results.bindings[0].s.value == "http://colin.maudry.com/ontologies/dgfr#" &&
					response.body.results.bindings[0].p.value == "http://purl.org/vocab/vann/preferredNamespacePrefix") {
					return "Variable successfully replaced."; }
				else {
					throw new Error("Variable not applied successfully.");
				}
			})
			.expect(200, done);
	});
	it('Longer variable names are not replaced (?o replaced, not ?obelix)', function(done) {
		request(app)
			.get('/api/tables/test3?$o="dgfr"')
			.expect(function(response) {
				if (response.body.results.bindings.length == 1 &&
					response.body.results.bindings[0].obelix.value == "http://colin.maudry.com/ontologies/dgfr#" &&
					response.body.results.bindings[0].p.value == "http://purl.org/vocab/vann/preferredNamespacePrefix") {
					return "Variable successfully replaced."; }
				else {
					console.log(JSON.stringify(response.body));

					throw new Error("Longer variable was affected.");
				}
			})
			.expect(200, done);
	});
	it('Populated variables that are present in the SELECT clause are removed (no subquery support).', function(done) {
		request(app)
			.get('/api/tables/test4?$o="dgfr"')
			.expect(function(response) {
				if (response.body.results.bindings.length == 1 &&
					response.body.results.bindings[0].o == undefined &&
					response.body.results.bindings[0].p.value == "http://purl.org/vocab/vann/preferredNamespacePrefix") {
					return "Variable successfully replaced."; }
				else {
					console.log(JSON.stringify(response.body));

					throw new Error("Longer variable was affected.");
				}
			})
			.expect(200, done);
	});
	it('Variables can also populate a URI.', function(done) {
		request(app)
			.get('/api/tables/test5?$namespace=<http://colin.maudry.com/ontologies/dgfr%23>&$property=<http://purl.org/vocab/vann/preferredNamespaceUri>')
			.expect(function(response) {
				if (response.body.results.bindings.length == 1 &&
					response.body.results.bindings[0].ontology.value == "http://colin.maudry.com/ontologies/dgfr#") {
					return "Variables successfully replaced."; }
				else {
					console.log(JSON.stringify(response.body));
					throw new Error("Longer variable was affected.");
				}
			})
			.expect(200, done);
	});
});

//
// PUT new queries or query updates
//

describe('Create, modify or delete canned queries, with basic auth', function() {
	this.timeout(4000);
  var testEndpoint = "http://dydra.com/colin-maudry/dgfr/sparql" ;

	it('PUT a table query update via URL encoded parameters', function(done) {
		request(app)
			.put('/api/tables/test?query=' + encodeURIComponent('select * where {?s ?p ?o} limit 1')
      + '&endpoint=' + encodeURIComponent(testEndpoint))
			.auth('user','password')
      .expect(200, done);
	});
	it('PUT a new graph query via URL encoded parameters', function(done) {
		request(app)
			.put('/api/graphs/test-to-delete?query=' + encodeURIComponent('describe ?s where {?s ?p ?o} limit 1')
      + '&endpoint=' + encodeURIComponent(testEndpoint))
			.auth('user','password')
			.expect(201, done);
	});
	it('PUT a tables query update with JSON (and some metadata fields)', function(done) {
		request(app)
			.put('/api/tables/test')
			.set('Content-Type','application/json')
			.auth('user','password')
			.send({"query": "select * where {?s ?p ?o} limit 1","name": "Test table update",
      "endpoint":testEndpoint})
			.expect(200, done);
	});
	it('PUT a tables query update with JSON (with no body.query), so 400', function(done) {
		request(app)
			.put('/api/tables/test')
			.set('Content-Type','application/json')
			.auth('user','password')
			.send({"name": "Test table update","endpoint":testEndpoint})
			.expect(400, done);
	});
  it('PUT a new table query with JSON (relying on default endpoint)', function(done) {
    request(app)
      .put('/api/tables/test6')
      .set('Content-Type','application/json')
      .auth('user','password')
      .send({"query": "select * where {?s ?p ?o} limit 1","name": "Test table with default endpoint 6"})
      .expect(201, done);
  });
  it('...and the new tables query works', function(done) {
		request(app)
			.get('/api/tables/test6')
			.set('Accept', 'application/sparql-results+json')
			.expect(200)
			.expect('Content-Type', /json/, done);
	});
	it('PUT a new tables query via URL encoded parameters', function(done) {
		request(app)
      .put('/api/tables/new?query=' + encodeURIComponent('select * where {?s ?p ?o} limit 25')
      + '&endpoint=' + encodeURIComponent(testEndpoint))
			.auth('user','password')
			.expect(201, done);
	});
	it('...and the new tables query works', function(done) {
		request(app)
			.get('/api/tables/new')
			.set('Accept', 'application/sparql-results+json')
			.expect(200)
			.expect('Content-Type', /json/, done);
	});
	it('An invalid query is rejected and not created.', function(done) {
		request(app)
      .put('/api/tables/test?query=' + encodeURIComponent('Zelect * where {?s ?p ?o} limit 1')
      + '&endpoint=' + encodeURIComponent(testEndpoint))
			.auth('user','password')
			.expect(400, done);
	});
	it('...the working query wasn\'t overriden by the bad one, and still works.', function(done) {
		request(app)
			.get('/api/tables/new')
			.set('Accept', 'application/sparql-results+json')
			.expect(200)
			.expect('Content-Type', /json/, done);
	});
	it('An empty query is rejected and not created.', function(done) {
		request(app)
      .put('/api/tables/test?query='
      + '&endpoint=' + encodeURIComponent(testEndpoint))
			.auth('user','password')
			.expect(400, done);
	});
	it('PUTing a too big query returns a 413 Request too large.', function(done) {
		var bigQuery = "{select * where {?s ?p ?o} limit 1'}";
		while (bigQuery.length < config.get('app.maxQueryLength')) {
			bigQuery += ",{select * where {?s ?p ?o} limit 1'}";
		}
		request(app)
      .put('/api/tables/test?query=' + encodeURIComponent(bigQuery)
      + '&endpoint=' + encodeURIComponent(testEndpoint))
			.auth('user','password')
			.expect(413, done);
	});
  it('DELETE the new graphs query, with credentials.', function(done) {
    request(app)
      .delete('/api/graphs/test-to-delete')
      .auth('user','password')
      .expect(200, done);
  });
	it('DELETE the new tables query, with credentials.', function(done) {
		request(app)
			.delete('/api/tables/new')
			.auth('user','password')
			.expect(200, done);
	});
	it('...the DELETEd new tables query is gone.', function(done) {
		request(app)
			.get('/api/tables/new')
			.expect(404, done);
	});
  it('...the DELETEd new tables query metadata is also gone.', function(done) {
    request(app)
      .get('/api/graphs/query-metadata.jsonld?$queryType=' + encodeURIComponent("router:TablesQuery")
      + "&$name=" + encodeURIComponent('"new"'))
      .expect(function(response) {
        if (response.body["@id"] === undefined) {
          return "Query metadata was successfully deleted."; }
        else {
          console.log(JSON.stringify(response.body));
          throw new Error("Query metadata was not deleted.");
        }
      })
      .expect(200, done);
  });
  it('DELETE the new tables query, with credentials.', function(done) {
    request(app)
      .delete('/api/tables/test6')
      .auth('user','password')
      .expect(200, done);
  });
	it('DELETE an inexistent query returns 404.', function(done) {
		request(app)
			.delete('/api/tables/random')
			.auth('user','password')
			.expect(404, done);
	});
});

//
// Authentication
//

describe('Authentication', function() {
	it('DELETE a query with no credentials returns 401.', function(done) {
		request(app)
			.delete('/api/tables/test')
			.expect(401, done);
	});
	it('DELETE a query with good username but no password returns 401.', function(done) {
		request(app)
			.delete('/api/tables/test')
			.auth('user','')
			.expect(401, done);
	});
	it('DELETE a query with no username and good password returns 401.', function(done) {
		request(app)
			.delete('/api/tables/test')
			.auth('','password')
			.expect(401, done);
	});
	it('POST a new query with no credentials returns 401.', function(done) {
		request(app)
			.put('/api/tables/new')
			.send('select * where {?s ?p ?o} limit 1')
			.expect(401, done);
	});

});

//
// POST and GET queries in passthrough mode
//

describe('POST and GET queries in passthrough mode', function() {
	this.timeout(4000);
	it('GET queries to /sparql are passed through for default endpoint', function(done) {
		request(app)
			.get('/api/sparql?query=select%20*%20where%20%7B%3Fs%20%3Fp%20%3Fo%7D%20limit%201')
			.expect(200)
			.expect('Content-Type', /xml|json|csv/, done)

	});
  it('GET queries to /sparql are passed through for provided endpoint (URL parameters)', function(done) {
    request(app)
      .get('/api/sparql?query=' + encodeURIComponent('select * where {?s ?p ?o} limit 5')
      + "&endpoint=" + encodeURIComponent('http://dydra.com/colin-maudry/dgfr/sparql'))
      .expect(200)
      .expect('Content-Type', /xml|json|csv/, done)

  });
  it('GET queries to /sparql are passed through for provided endpoint and return accepted content type', function(done) {
    request(app)
      .get('/api/sparql?query=' + encodeURIComponent('select * where {?s ?p ?o} limit 5')
      + "&endpoint=" + encodeURIComponent('http://dydra.com/colin-maudry/dgfr/sparql'))
      .set("Accept","text/csv")
      .expect(200)
      .expect('Content-Type', /csv/, done)

  });
	it('GET empty queries to /sparql returns 400', function(done) {
		request(app)
			.get('/api/sparql')
			.expect(400, done);
	});
	it('GET queries to /query are passed through', function(done) {
		request(app)
			.get('/api/query?query=select%20*%20where%20%7B%3Fs%20%3Fp%20%3Fo%7D%20limit%201')
			.expect(200)
			.expect('Content-Type', /xml|json|csv/, done)
	});
	it('GET malformed queries to /sparql returns 400', function(done) {
		request(app)
			.get('/api/sparql?query=zelect%20*%20where%20%7B%3Fs%20%3Fp%20%3Fo%7D%20limit%201')
			.expect(400, done);
	});
	it('POST queries to /sparql are passed through to the default endpoint.', function(done) {
		request(app)
			.post('/api/sparql')
      .set('Content-Type','application/json')
      .send({"query": "select * where {?s ?p ?o} limit 1"})
			.expect(200)
			.expect('Content-Type', /xml|json|csv/, done);
	});
	it('POST empty queries to /sparql returns 400', function(done) {
		request(app)
			.post('/api/sparql')
      .set('Content-Type','application/json')
			.expect(400, done);
	});
	it('POST queries to /query work as well.', function(done) {
		request(app)
			.post('/api/query')
      .send({"query": "select * where {?s ?p ?o} limit 1"})
			.expect(200)
			.expect('Content-Type', /xml|json|csv/, done);
	});
	it('POST malformed queries to /sparql returns 400', function(done) {
		request(app)
			.post('/api/sparql')
      .send({"query": "zelect * where {?s ?p ?o} limit 1"})
			.expect(400, done);
	});
  it('PUT returns a 405 error.', function(done) {
    request(app)
      .put('/api/sparql')
      .send({"query": "select * where {?s ?p ?o} limit 1"})
      .expect(405, done);
  });
});
