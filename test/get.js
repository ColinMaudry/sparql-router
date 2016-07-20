var request = require('supertest');
var config = require('config');
var app = require('./../app');
var fs = require('fs');

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
  it('/api/tables/test.rq returns the query text.', function(done) {
    request(app)
      .get('/api/tables/test2.rq')
      .expect('Content-Type', 'application/sparql-query')
      .expect(function(response) {
        if (response.text === "select * where {?s ?p ?under_score} limit 1") {return "Returned query text."  }
        else {throw new Error("Didn't return query text" + response.text);}
      })
      .expect(200, done);
  });
  it('/api/tables/test with Accept:application/sparql-query returns the query text.', function(done) {
    request(app)
      .get('/api/tables/test2')
      .set('Accept', 'application/sparql-query')
      .expect('Content-Type', 'application/sparql-query')
      .expect(function(response) {
        if (response.text === "select * where {?s ?p ?under_score} limit 1") {return "Returned query text."  }
        else {throw new Error("Didn't return query text: \n" + response.text);}
      })
      .expect(200, done);
  });
});
