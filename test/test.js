var request = require('supertest');
var fs = require('fs');
var http = require('http');
var app = require('./../app');




describe('Basic tests', function() {

	it('App runs and / returns a 200 status code', function(done) {
		request(app)
			.get('/')
			.expect(200, done)
	});
	
	it('The configured endpoint returns 200 and JSON Sparql results', function(done) {
		request(app)
			.get('/tables/test') 
			.set('Accept', 'application/sparql-results+json')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

	it('The configured endpoint has data loaded', function(done) {
		request(app)
			.get('/tables/test') 
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
}); 
describe('GET results from canned queries', function() {
	it('/random/random returns 404', function(done) {
		request(app)
			.get('/random/random') 
			.expect(404, done);
	});
	it('/tables/random returns 404', function(done) {
		request(app)
			.get('/tables/random') 
			.expect(404, done);
	});
	it('/tables/test.csv returns text/csv results', function(done) {
		request(app)
			.get('/tables/test.csv')
			.expect('Content-Type', /text\/csv/) 
			.expect(200, done);
	});
	it('/graphs/test.rdf returns application/rdf+xml results', function(done) {
		request(app)
			.get('/graphs/test.rdf')
			.expect('Content-Type', /application\/rdf\+xml/) 
			.expect(200, done);
	});
	it('/tables/test.xxx returns 400', function(done) {
		request(app)
			.get('/tables/test.xxx')
			.expect(400, done);
	});
}); 

describe('Create, modify or delete canned queries', function() {
	it('POST a query update via data', function(done) {
		request(app)
			.post('/tables/test')
			.send('select * where {?s ?p ?o} limit 1')
			.expect(200, done);
	});
	it('POST a new query via data', function(done) {
		request(app)
			.post('/tables/new')
			.send('select * where {?s ?p ?o} limit 1')
			.expect(201, done);
	});

	it('...and the POSTed query works', function(done) {
		request(app)
			.get('/tables/new')
			.set('Accept', 'application/sparql-results+json')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});
	it('DELETE the new query.', function(done) {
		request(app)
			.delete('/tables/new')
			.expect(200, done);
	});
	it('The new query is gone.', function(done) {
		request(app)
			.get('/tables/new')
			.expect(404, done);
	});
	it('DELETE an inexistent query returns 404.', function(done) {
		request(app)
			.delete('/tables/random')
			.expect(404, done);
	});

}); 


describe('POST and GET queries in passthrough mode', function() {
	it('GET queries to /sparql are passed through', function(done) {
		request(app)
			.get('/sparql?query=select%20*%20where%20%7B%3Fs%20%3Fp%20%3Fo%7D%20limit%201')
			.expect('Content-Type', /xml|json|csv/)
			.expect(200, done)
	});
	it('GET queries to /query are 301 redirected to /sparql', function(done) {
		request(app)
			.get('/query?query=select%20*%20where%20%7B%3Fs%20%3Fp%20%3Fo%7D%20limit%201')
			.expect('Location', '/sparql?query=select * where {?s ?p ?o} limit 1')
			.expect(301, done)
	});
	it('GET malformed queries to /sparql returns 400', function(done) {
		request(app)
			.get('/sparql?query=zelect%20*%20where%20%7B%3Fs%20%3Fp%20%3Fo%7D%20limit%201')
			.expect(400, done);
	});
	it('POST queries to /sparql are passed through', function(done) {
		request(app)
			.post('/sparql')
			.send('select * where {?s ?p ?o} limit 1')
			.expect('Content-Type', /xml|json|csv/)
			.expect(200, done);
	});
	it('POST queries to /query are 301 redirected to /sparql', function(done) {
		request(app)
			.post('/query')
			.send('select * where {?s ?p ?o} limit 1')
			.expect('Location', '/sparql')
			.expect(301, done)
	});
	it('POST malformed queries to /sparql returns 400', function(done) {
		request(app)
			.post('/sparql')
			.send('zelect * where {?s ?p ?o} limit 1')
			.expect(400, done);
	});
});



