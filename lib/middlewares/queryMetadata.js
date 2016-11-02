var config = require('config');
var debug = require('debug')('routes');

module.exports  = function(request,response,next) {
  if (request.body.query) {
    request.queryMetadata = request.body;
    next();
  } else if (request.query && request.query.query) {
    request.queryMetadata = request.query;
    request.queryMetadata.query = decodeURIComponent(request.query.query);
    next();
  } else {
    next();
  }

}
