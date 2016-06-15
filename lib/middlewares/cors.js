module.exports  = function(request,response,next) {
  //CORS support
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  response.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT");

  next();

}
