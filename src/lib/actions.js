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
  if (app.config.public.scheme === 'https') {scheme = https} else {scheme = http};

  var req = scheme.get(url, (res) => {
      var result = "";
      res.setEncoding('utf8');
      res.on('data', (data) => {
        result += data;
      });
      res.on('end',function() {
        store.dispatch('MESSAGE', "Request succeeded",false);
      });
  });
  req.on('error', (e) => {
    console.log('Error: problem getting query metadata: ' + e.message);
    store.dispatch('MESSAGE', "Request failed",true);
  });
  req.end();
}
