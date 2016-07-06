import http from 'http'
import https from 'https'

module.exports.sendQuery = function (options,data,results,message) {
  // console.log(JSON.stringify(options,null,2));
  // console.log(JSON.stringify(form.query,null,2));
  var result = "";
  var scheme = {};
  if (options.scheme === 'https') {scheme = https} else {scheme = http};
  var req = scheme.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (data) => {
        result += data;
      });
      res.on('end', () => {
          if (res.statusCode < 300) {
            results.type = module.exports.stringBefore(res.headers["content-type"],';').replace(' ','');
            message.error = false;

            if (/json/.test(results.type)) {
              //console.log(result);
              results.data = JSON.parse(result);
            } else {
              var now = new Date();
              now = now.toString();

              result = now + "\n" + result.replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/\t/g,'  ');
              message.text = result;
            }
          } else {
            result = result.replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/\t/g,'  ');
            message.error = true;
            message.text = result;
          }
      })
    });
    req.on('error', (e) => {
        throw new Error ("There was an error sending the form data: " + e.message + ".\n");
    });
    req.write(JSON.stringify(data));
    req.end();
};

module.exports.stringBefore = function (str, sep) {
 var i = str.indexOf(sep);

 if(i > 0)
  return  str.slice(0, i);
 else
  return str;
};

module.exports.capitalizeFirst = function(str) {
	return str.substring(0, 1).toUpperCase() + str.substring(1);
}
