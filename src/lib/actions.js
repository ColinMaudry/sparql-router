import http from 'http'
import https from 'https'
import functions from './functions.js'

// An action will receive the store as the first argument.
// Since we are only interested in the dispatch (and optionally the state)
// we can pull those two parameters using the ES6 destructuring feature


export const getQueryMetadata = function (store,type,name) {

  var queryType = encodeURIComponent("router:" + functions.capitalizeFirst(type) + "Query");
  var url = siteRootUrl + "/api/graphs/query-metadata.jsonld?$name=%22" + name + "%22&queryType=" + queryType;
  var scheme = {};
  var resultObject = {};
  if (app.config.public.scheme === 'https') {scheme = https} else {scheme = http};

  var req = scheme.get(url, (res) => {
      var result = "";
      res.setEncoding('utf8');
      res.on('data', (data) => {
        result += data;
      });
      res.on('end',function() {
        console.log(result);

        resultObject = JSON.parse(result);
        var query = {};
        query.name = resultObject.label;
        query.author = resultObject.author;
        query.endpoint = resultObject.endpoint;
        query.modificationDate = resultObject.modificationDate;
        scheme.get(siteRootUrl + "/api/" + type + "/" + name + ".rq", (res2) => {
          var result = "";
          res2.on('data', (chunk) => {
            result += chunk;
            console.log(result);
            query.query = result;
            store.dispatch('QUERY', query);
           });
        });
      });
  });
  req.on('error', (e) => {
    console.log('Error: problem getting query metadata: ' + e.message);
    store.dispatch('MESSAGE', "Request failed",true);
  });
  req.end();
}
