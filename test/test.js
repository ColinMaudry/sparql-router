var request = require('supertest');
var fs = require('fs');
var http = require('follow-redirects').http;
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
	it('/tables/random returns 404', function(done) {
		request(app)
			.get('/tables/random') 
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

	it('GET queries to /sparql without "query" parameter returns 400', function(done) {
		request(app)
			.get('/sparql?queri=select%20*%20where%20%7B%3Fs%20%3Fp%20%3Fo%7D%20limit%201')
			.expect(400, done);
	});
});



