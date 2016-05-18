var passport = require('passport');
var config = require('config');
var debug = require('debug');
var http = require('http');
var fs = require('fs');



//My functions
var functions = require('./functions');


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

module.exports = function(app) {




app.get('/api/update/*',
passport.authenticate('basic', { session: false }),
function(request,response, next) {
	next();
});



}
