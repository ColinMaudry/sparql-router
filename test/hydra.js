var request = require('supertest');
var config = require('config');
var app = require('./../app');
var fs = require('fs');

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
