# SPARQL router 0.2.0 

#### A NodeJS/Express application to serve canned SPARQL queries to the world.

| [master](https://github.com/ColinMaudry/sparql-router)  |  [develop](https://github.com/ColinMaudry/sparql-router/tree/develop) |
| ------------- | ------------- |
| [![Build Status](https://travis-ci.org/ColinMaudry/sparql-router.svg?branch=master)](https://travis-ci.org/ColinMaudry/sparql-router)  | [![Build Status](https://travis-ci.org/ColinMaudry/sparql-router.svg?branch=develop)](https://travis-ci.org/ColinMaudry/sparql-router)  |

## Description

[SPARQL](https://en.wikipedia.org/wiki/SPARQL) is the query language to retrieve data from RDF triple stores. I often had the issue that fellow developers or data fanatics asked for data that was in a triple store, but they don't know SPARQL.

This module solves the issue:

1. You write the query and gives it a name (e.g. `biggest-asian-cities`)
2. You save it under /tables, /graphs or /update, depending on the query type (SELECT, CONSTRUCT, DESCRIBE, SPARQL Update)
3. You give the URL to your fellow developer, picking the right format for their usage:
	- `http:/yourhost/tables/biggest-asian-cities.csv` for manipulations as a spreadsheet
	- `http:/yourhost/tables/biggest-asian-cities.json` as input for a Web app
	- `http:/yourhost/tables/biggest-asian-cities.xml` if they are into XML
4. They get fresh updated results from the store every time they hit the URL!

## Features

- Exposes SPARQL queries as simple URLs, with choice of result format
- A canned query is a simple file located in `/public/tables`, `/public/graphs` or `/public/update` depending on the query type (SELECT, CONSTRUCT, DESCRIBE, SPARQL Update)
- Beside using FTP and SSH, you can POST a new canned query to `/tables/{query-name}`, `/graphs/{query-name}` or `/update/{query-name}`
- For more query reuse, possibility to populate variable values in the query by passing parameters
- Supports content negotiation (via the `Accept` HTTP header)
- Possibility to GET or POST a SPARQL query on `/sparql` and get the results, without saving it

[A screenshot of the tests as overview of the features](test/tests.png).

[Detailed usage documentation](https://github.com/ColinMaudry/sparql-router/wiki/Using-SPARQL-router)

**Demo**

An instance is deployed on Heroku, with API documentation:

https://sparql-router.herokuapp.com

You can create new queries through this form. Authentication is disabled in the demo:

https://sparql-router.herokuapp.com/#!/canned_query/post_tablesOrGraphs_name

**[Upcoming features](https://github.com/ColinMaudry/sparql-router/issues?q=is%3Aissue+is%3Aopen+-label%3Abug)**

**[Known issues](https://github.com/ColinMaudry/sparql-router/issues?q=is%3Aissue+is%3Aopen+label%3Abug)**

Now it's still jut a useful middleman between your RDF data and your data consumers, but the objective is to develop an open platform to share SPARQL queries on any endpoint. With [a nice UI](https://github.com/ColinMaudry/sparql-router-ui).

## Requirements

[NodeJS and NPM](https://nodejs.org/en/download/stable/) must be installed.

They are also available in most Linux package managers as `nodejs` and `npm`.

## Installation

With the test framework:

```bash
npm install sparql-router 
```

Without:
```bash
npm install sparql-router --production
```

## Configuration

The configuration sits in [`config/default.json`](config/default.json). The default configuration queries the repository where I store [the data.gouv.fr (dgfr:) ontology](https://github.com/ColinMaudry/datagouvfr-rdf/blob/master/ontology/dgfr.ttl). This is also the data that I use for the tests.

[Certain actions](#actions-that-require-authentication) must be authenticated using the master user name and password:

- `app.user`: the master user name
- `app.password`: the master password

The endpoint configuration, where you configure the default SPARQL endpoint to be used by the queries.

- `endpoint.scheme`: whether the endpoint is reachable via http or https protocol.
- `endpoint.hostname`: the address where the SPARQL endpoint is deployed. Example: `mydomain.com`
- `endpoint.port`: the port number on which the SPARQL endpoint runs. 
- `endpoint.queryPath`: this is the path used to make the full endpoint URL.
If the endpoint is `http://mydomain.com/data/sparql`, `queryPath` must be `/data/sparql`.
- `endpoint.queryParameterName`: When passing a custom query to a SPARQL endpoint, you must use a URL parameter (Example: `http://mydomain.com/data/sparql?query=select%20*%20where%20%7B%3Fs%20%3Fp%20%3Fo%7D%20limit%201`). It's usally `query`, but in case your endpoint uses a different parameter name, you can change it here. 
- `endpoint.headers`: an object in which you can add custom headers that will be sent with all SPARQL queries to the configured endpoint.
- `app.defaultAccept`: when no `Accept` format is provided by the user request, these content types are requested by default

Although it's only necessary for the API documentation and having helpful feedback when creating a query, you should configure the public facing URL (the URL your users hit to use the API):

- `app.public.scheme`: whether the API is reachable via http or https protocol.
- `app.public.hostname`: the domain where the API is deployed.
- `app.public.port`: the port through which the API is reachable. If it's 80 (http) or 443 (https) you can leave it empty.

### Test

I haven't found a proper way to mock a triple store for testing purposes. I consequently use a remote triple store. That means the tests only work if the machine has Internet access.

To run the tests:

```bash
npm test
```

[Overview of the tests](test/tests.png).

Tests rely on [mocha](http://mochajs.org/) and 
[supertest](https://www.npmjs.com/package/supertest).

## Start it

```
node bin/www
```

## Use it

See this wiki page for detailed instructions: [Using SPARQL router](https://github.com/ColinMaudry/sparql-router/wiki/Using-SPARQL-router)

The API documentation can be found [here](http://sparql-router.herokuapp.com/) (development version). If you're running the app, at the root URL (/).

### Actions that require authentication

The actions that are not read-only on the canned queries or the data require [basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).

- HTTP POST to create or update a query
- HTTP DELETE to delete a query
- HTTP GET  on the `/update` endpoint (because it affects the data)

## Change log

#### 0.2.0

- Support for SPARQL Update queries (requires authentication)
- Possibility to populate query variable values via URL parameters!
- Queries created and updated via HTTP POST are tested before creation/update
- The URL of the query is returned when creating or updating a query
- Applied NodeJS security best practices (with [helmet](https://www.npmjs.com/package/helmet))

#### 0.1.0

- Enabled canned queries
- Extension (.csv, .xml, etc.) defines the format returned by the endpoint
- Passthrough queries via `/sparql`
- Create new canned queries by HTTP POST, SSH or FTP
- Basic auth for POST and DELETE
- API doc written in Swagger
- Support for HTTPS endpoints
- CORS enabled

## License

MIT license

If you use it, I really appreciate public statements such as [a tweet](https://twitter.com/intent/tweet?text=Wow%2C%20thanks%20%40CMaudry%20for%20making%20SPARQL%20router!%20https%3A%2F%2Fgithub.com%2FColinMaudry%2Fsparql-router%20%23SPARQL)!
