var express = require('express');
var app = express();

app.use(express.static('public'));


app.get('/',function(request,response) {
	response.send("Hello");
});
app.get('/bla',function(request,response) {
	response.send("Hello");
});

module.exports = app;

app.listen(3000,function(){
	console.log('Started app on port 3000.')
});