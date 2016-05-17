var expose = require('express-expose');
var passport = require('passport');
var cors = require('express-cors');
var express = require('express');
var config = require('config');
var helmet = require('helmet');
var debug = require('debug');
var fs = require('fs');
var app = express();

var routes = require("./lib/routes");
var tablesGraphs = require('./lib/routes/tablesGraphs');

//My functions
var functions = require('./lib/functions');

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
apiConfig.host = config.get('app.public.hostname') + functions.getPublicPort();
apiConfig.schemes = [];
apiConfig.schemes.push(config.get('app.public.scheme'));
fs.writeFile(apiConfigFile, JSON.stringify(apiConfig, null, 4), function (err) {
  if (err) return console.log(err);
  debug('Writing API configuration to ' + apiConfigFile);
});

//Update Hydra context with actual URL
var hydraContextFile = "./public/api/hydra.jsonld";
var siteRootUrl = functions.getSiteRootUrl();
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

app.set('views','./lib/views');
app.set('view engine', 'pug');
app = expose(app);

//Mapping content-types with file extensions
express.static.mime.define({'application/sparql-query': ['rq']});
express.static.mime.define({'application/sparql-update': ['ru']});
express.static.mime.define({'application/ld+json': ['jsonld']});

//Security
app.use(helmet());

app.get('/', function(request,response) {
	response.expose('var siteRootUrl = "' + siteRootUrl + '";');
	response.render('index', { layout: false });
});

app.use(express.static('public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.param('type', function (req, res, next, type) {
	req.savedparams = {};
  req.savedparams.type = type;
  next();
});
app.use('/api/:type(tables|graphs|update)', tablesGraphs);
routes(app);

module.exports = app;
