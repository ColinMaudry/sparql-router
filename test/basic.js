var request = require('supertest');
var config = require('config');
var app = require('./../app');
var fs = require('fs');

console.log("Environment: " + process.env.NODE_ENV + " (config/" + process.env.NODE_ENV + ".json)");


//
// Basic testing
//

describe('Basic tests', function() {

	it('API documentation runs and /api returns 200 and JSON', function(done) {
		request(app)
			.get('/api')
			.expect('Content-Type',/json/)
			.expect(200, done)
	});
  it('API home page runs and /api + asking for HTML returns 200 and Swagger UI', function(done) {
    request(app)
      .get('/api/')
      .set('accept','text/html')
      .expect('Content-Type',/html/)
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
  it('OPTIONS returns CORS-friendly headers.', function(done) {
		request(app)
			.options('/')
			.expect("Access-Control-Allow-Origin", "*")
      .expect("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      .expect("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT")
			.expect(200, done)
	});
	it('POST typically designed to brew coffee is ineffective.', function(done) {
		request(app)
			.post('/api')
			.set('Content-Type','application/coffee-pot-command')
			.expect(418, done)
	});
});
