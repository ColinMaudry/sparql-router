var request = require('supertest');
var config = require('config');
var app = require('./../app');
var fs = require('fs');

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
