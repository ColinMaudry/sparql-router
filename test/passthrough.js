var request = require('supertest');
var config = require('config');
var app = require('./../app');
var fs = require('fs');

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
	it('POSTed queries to /sparql are passed through to the default endpoint.', function(done) {
		request(app)
			.post('/api/sparql')
      .set('Content-Type','application/json')
      .send({"query": "select * where {?s ?p ?o} limit 1"})
			.expect(200)
			.expect('Content-Type', /xml|json|csv/, done);
	});
  it('POSTed queries to /sparql can override the default endpoint.', function(done) {
    request(app)
      .post('/api/sparql')
      .set('Content-Type','application/json')
      .set('Accept','application/sparql-results+json')
      .send({"query": "select * where {?s ?p 'dgfr'} limit 1", "endpoint" : "http://dydra.com/colin-maudry/datagouvfr/sparql"})
      .expect(function(response) {
        if (response.body.results.bindings.length === 0) {
          return "Endpoint successfully overriden."; }
        else {
          throw new Error("Endpoint not overriden.");
        }
      })
      .expect(200)
      .expect('Content-Type', /xml|json|csv/, done);
  });
  it('GET queries to /sparql can override the default endpoint.', function(done) {
    request(app)
      .get('/api/sparql?query=select%20*%20where%20%7B%3Fs%20%3Fp%20%22dgfr%22%7D%20limit%201&endpoint=http%3A%2F%2Fdydra.com%2Fcolin-maudry%2Fdatagouvfr%2Fsparql')
      .set('Accept','application/sparql-results+json')
      .expect(function(response) {
        if (response.body.results.bindings.length === 0) {
          return "Endpoint successfully overriden."; }
        else {
          throw new Error("Endpoint not overriden.");
        }
      })
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
