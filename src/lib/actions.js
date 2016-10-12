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

export const createQuery = function (store,query,type,slug,router) {
  var callback = function (store,res,result) {
    if (res.statusCode < 300) {
      store.dispatch('MESSAGE',"Query created successfully.",false);
      router.go({name: 'edit', params : {
        type: type,
        slug: slug
      }});
      } else {
      result = result.replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/\t/g,'  ');
      store.dispatch('MESSAGE',result,true);
    }
  };
  module.exports.writeQuery(store,query,type,slug,callback);
}

export const writeQuery = function (store,query,type,slug,cb) {
  var scheme = {};
  var options = {
    data: query,
    scheme : app.config.public.scheme,
    hostname: app.config.public.hostname,
    port: app.config.public.port,
    path: "/api/" + type + "/" + slug,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept" : "*/*"
    }
  };

  module.exports.sendHTTPRequest(store,options,cb);

}

export const testQuery = function (store,query,type) {
  var accept = (type === "tables") ? "application/sparql-results+json" : "text/turtle; q=0.2, application/ld+json";
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
      "Content-Type": "application/json",
      "accept" : accept
    }
  };
  module.exports.sendHTTPRequest(store,options,module.exports.getQueryResults);
};

export const sendHTTPRequest = function (store, options,cb) {
  console.log(JSON.stringify(options,null,2));
  var data = (options.method != "GET" && options.data) ? options.data : "";
  var scheme = {};
  var result = "";
  if (options.scheme === 'https') {scheme = https} else {scheme = http};

  var req = scheme.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (data) => {
        result += data;
      });
      res.on('end', () => {
          cb(store,res,result);
      })
    });
    req.on('error', (e) => {
        throw new Error ("There was an error sending the form data: " + e.message + ".\n");
    });
    req.write(JSON.stringify(data));
    req.end();
};


export const getQueryResults = function (store,res, result) {
  var queryResults = {};
  if (res.statusCode < 300 || res.statusCode === 304) {
    queryResults.type = functions.stringBefore(res.headers["content-type"],';').replace(' ','');

    if (/json/.test(queryResults.type)) {
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
};
