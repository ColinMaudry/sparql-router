var FileStreamRotator = require('file-stream-rotator')
var bodyParser = require('body-parser');
var expose = require('express-expose');
var debug = require('debug')('routes');
var passport = require('passport');
var cors = require('express-cors');
var express = require('express');
var morgan = require('morgan');
var config = require('config');
var helmet = require('helmet');
var fs = require('fs');
var app = express();

var apiDoc = require('./lib/routes/apiDoc');
var sparql = require('./lib/routes/sparql');
var cannedQueries = require('./lib/routes/cannedQueries');

//My middlewares
var queryMetadata = require('./lib/middlewares/queryMetadata');
var cors = require('./lib/middlewares/cors');

//My functions
var functions = require('./lib/functions');

var parseJson = bodyParser.json({ extended: false });


/*
MIT License (MIT)

Copyright (c) 2016 Colin Maudry (http://colin.maudry.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/

//Update API documentation configuration
var apiConfigFile = "./public/api/swagger.json";
var apiConfig = require(apiConfigFile);
var publicAppConfig = config.get('app.public');
apiConfig.host = publicAppConfig.hostname + functions.getPort(publicAppConfig);
apiConfig.schemes = [];
apiConfig.schemes.push(publicAppConfig.scheme);
fs.writeFile(apiConfigFile, JSON.stringify(apiConfig, null, 4), function (err) {
  if (err) return console.log(err);
  debug('Writing API configuration to ' + apiConfigFile);
});

//Update Hydra context with actual URL
var hydraContextFile = "./public/api/hydra.jsonld";
siteRootUrl = functions.getSiteRootUrl();
fs.readFile(hydraContextFile,'utf8', function (err, data) {
  if (err) {throw err} else {
    var hydraContext = JSON.parse(data);
    hydraContext["@base"] = siteRootUrl + "/api/hydra.jsonld#";
    hydraContext["@id"] = siteRootUrl + "/api/hydra.jsonld";
    fs.writeFile(hydraContextFile, JSON.stringify(hydraContext, null, 4), function (err) {
      if (err) return console.log(err);
      debug('Writing Hydra context to ' + hydraContextFile);
    });
  };
});

// System endpoint
var systemEndpointConfig = config.get('endpoints.system');
var defaultEndpointConfig = config.get('endpoints.default');
var systemEndpointPort = functions.getPort(systemEndpointConfig);
var defaultEndpointPort = functions.getPort(defaultEndpointConfig);

systemEndpointUpdate = systemEndpointConfig.scheme + "://" + systemEndpointConfig.hostname + systemEndpointPort + systemEndpointConfig.updatePath;
systemEndpointQuery = systemEndpointConfig.scheme + "://" + systemEndpointConfig.hostname + systemEndpointPort + systemEndpointConfig.queryPath ;
defaultEndpointUpdate = defaultEndpointConfig.scheme + "://" + defaultEndpointConfig.hostname + defaultEndpointPort + defaultEndpointConfig.updatePath ;
defaultEndpointQuery = defaultEndpointConfig.scheme + "://" + defaultEndpointConfig.hostname + defaultEndpointPort + defaultEndpointConfig.queryPath ;

app.set('case sensitive routing', false);
app.set('strict routing', false);
app.set('views', './lib/views');
app.set('view engine', 'pug');
app = expose(app);

//Mapping content-types with file extensions
express.static.mime.define({'application/sparql-query': ['rq']});
express.static.mime.define({'application/sparql-update': ['ru']});
express.static.mime.define({'application/ld+json': ['jsonld']});

//Security
app.use(helmet());
app.use(cors);

//Logging
var logDirectory = __dirname + '/log'
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'weekly',
  verbose: false
})
app.use(morgan('combined', {stream: accessLogStream}))

app.get('/', function(request,response) {
  debug(request.url + " .get");
  var exposed = {};

  exposed.config = JSON.parse(JSON.stringify(config.get('app')));
  exposed.defaultEndpoint = defaultEndpointQuery;
  exposed.config.user = "hidden";
  exposed.config.password = "hidden";
  exposed.config.port = request.socket.localPort;

  response.expose(exposed);
  response.expose('var siteRootUrl = "' + siteRootUrl + '";');
	response.render('index', { layout: false, analytics: config.get("app.public.analytics") });
});

app.options('*',function(request,response){
  response.sendStatus(200)
});

app.param('type', function (req, res, next, type) {
	req.savedparams = {};
  req.savedparams.type = type;
  next();
});

app.use(function(request,response,next) {
  //Set app root directory
  request.appRoot = __dirname;
  next();
});

app.use('/api', apiDoc);
app.use(parseJson);
app.use(queryMetadata);
app.use('/api/:type(tables|graphs|ask|update)', cannedQueries);
app.use('/api/:sparql(sparql|query)', sparql);
app.use(express.static('public'));
app.use(function(err, req, res, next) {
  debug(req.url + " Mayday!")
  console.error(err.stack);
  res.status(500).send('Something broke! Please contact the developer.');
});

module.exports = app;
