var config = {
	endpoint : {
		hostname: "localhost",
		port: 3030,
		queryPath: '/ds/query',
		queryParameterName: 'query',
		headers: {}
	},
	defaultAccept : "application/sparql-results+json",
	typeByExtension : {
		tables : {
			'csv' : 'text/csv',
			'json' : 'application/sparql-results+json',
			'srj' : 'application/sparql-results+json',
			'srx' : 'application/sparql-results+xml',
			'xml' : 'application/sparql-results+xml'
		},
		graphs : {
			'xml' : 'application/rdf+xml',
			'rdf' : 'application/rdf+xml',
			'ttl' : 'text/turtle',
			'jsonld' : 'application/ld+json',
			'nt' : 'application/n-triples',
			'json' : 'application/ld+json'
		}		
	}
}