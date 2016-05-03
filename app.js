var Strategy = require('passport-http').BasicStrategy
var passport = require('passport');
var cors = require('express-cors');
var express = require('express');
var config = require('config');
var helmet = require('helmet');
var debug = require('debug');
var fs = require('fs');
var app = express();

var routes = require("./lib/routes");

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
var apiConfigFile = "./public/swagger.json";
var apiConfig = require(apiConfigFile);
apiConfig.host = config.get('app.public.hostname') + functions.getPublicPort();
apiConfig.schemes = [];
apiConfig.schemes.push(config.get('app.public.scheme'));
fs.writeFile(apiConfigFile, JSON.stringify(apiConfig, null, 4), function (err) {
  if (err) return console.log(err);
  debug('Writing API configuration to ' + apiConfigFile);
});

//Mapping content-types with file extensions
express.static.mime.define({'application/sparql-query': ['rq']});
express.static.mime.define({'application/sparql-update': ['ru']});

//Security
app.use(helmet());

app.use(express.static('public'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

routes(app);

//Authenticate user
passport.use(new Strategy(
  function(username, password, cb) {
    if (
      config.get("app.authentication") === false ||
      (config.get("app.authentication") === true &&
      username === config.get("app.user") &&
      password === config.get("app.password"))
      )      
       {      
    	return cb(null, username);
    } else {
    	return cb(null, false);
    }
    })
  );


module.exports = app;


