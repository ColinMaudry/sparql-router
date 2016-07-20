var request = require('supertest');
var config = require('config');
var app = require('./../app');
var fs = require('fs');

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
