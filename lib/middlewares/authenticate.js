var config = require('config');
var debug = require('debug')('routes');


module.exports  = function(request,response,next) {
  //If authentication is disabled, inject dummy user:password to trigger authentication menchanism and prevent 401
  if (config.get('app.authentication') === false) {
    var authorization = "Basic ";
    var credentials = new Buffer("user:pass").toString('base64');
    authorization += credentials;
    request.headers.authorization = authorization;
    debug("Authorization: " + authorization);
    next();
  } else {
    debug("Authorization: " + request.headers.authorization);
    next();
  }
}
