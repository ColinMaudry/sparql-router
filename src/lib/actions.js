import http from 'http'
import slug from 'slug'
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

export const updateQuery = function (store,query) {
  store.dispatch('QUERY', query);
}

export const updateForm = function (store,form) {
  store.dispatch('FORM', form);
}

export const updateSlug = function (store,name) {
  var slug = sanitize(slug(store.query.name).toLowerCase());
  store.dispatch('SLUG', slug);
}

export const writeQuery = function (store,type,slug) {
  var options = {
    scheme : app.config.public.scheme,
    hostname: app.config.public.hostname,
    port: app.config.port,
    path: "/api/" + type + "/" + slug,
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "accept" : "*/*"
    }
  };
  module.exports.getQueryResults(store,options);
}

export const testQuery = function (store,query,type) {
  var accept = (type === "tables") ? "application/sparql-results+json" : "text/turtle; q=0.2, application/ld+json";
  console.log("type = " + type);
  var options = {
    data: {
      query: query.query,
      endpoint: query.endpoint
    },
    scheme : app.config.public.scheme,
    hostname: app.config.public.hostname,
    port: app.config.public.port,
    path: "/api/sparql",
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept" : accept
    }
  };
  module.exports.getQueryResults(store,options);
}

export const getQueryResults = function (store, options) {
  console.log(JSON.stringify(options,null,2));
  // console.log(JSON.stringify(form.query,null,2));
  var result = "";
  var data = (options.method === "POST" && options.data) ? options.data : "";
  var queryResults = {};
  var scheme = {};
  if (options.scheme === 'https') {scheme = https} else {scheme = http};
  var req = scheme.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (data) => {
        result += data;
      });
      res.on('end', () => {
          if (res.statusCode < 300) {

            queryResults.type = functions.stringBefore(res.headers["content-type"],';').replace(' ','');

            if (/json/.test(queryResults.type)) {
              //console.log(result);
              queryResults.data = JSON.parse(result);
              store.dispatch('RESULTS',queryResults);
              store.dispatch('MESSAGE',"",false);
            } else {
              var now = new Date();
              now = now.toString();
              result = now + "\n" + result.replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/\t/g,'  ');
              store.dispatch('MESSAGE',result,false);
            }
          } else {
            result = result.replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/\t/g,'  ');
            store.dispatch('MESSAGE',result,true);
          }
      })
    });
    req.on('error', (e) => {
        throw new Error ("There was an error sending the form data: " + e.message + ".\n");
    });
    req.write(JSON.stringify(data));
    req.end();
};
