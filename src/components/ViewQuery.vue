<template>
  <div class="container-fluid">
    <div v-if="message.error === false" class="row">
      <div class="col-md-8 col-md-offset-2 actions">
        <button type="button" class="btn btn-primary navbar-left" v-on:click="goTo('edit')">Edit</button>
        <button type="button" v-on:click="showDetails()" class="btn btn-default navbar-left">+ Details</button>
        <span v-if="$route.params.type === 'tables'">
          <a type="button" href="{{ queryBaseUrl + 'json' }}" class="btn btn-default navbar-right">JSON</a>
          <a type="button" href="{{ queryBaseUrl + 'xml' }}" class="btn btn-default navbar-right">XML</a>
          <a type="button" href="{{ queryBaseUrl + 'csv' }}" class="btn btn-default navbar-right">CSV</a>
        </span>
        <span v-if="$route.params.type === 'graphs'">
          <div class="btn-group navbar-right" >
            <a href="{{ queryBaseUrl + 'xml' }}" class="btn btn-default">XML</a>
            <a href="#" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></a>
            <ul class="dropdown-menu">
              <li><a href="{{ queryBaseUrl + 'rdf' }}">RDF/XML</a></li>
              <li><a href="{{ queryBaseUrl + 'trix' }}">TriX</a></li>
            </ul>
          </div>
          <a type="button" href="{{ queryBaseUrl + 'nt' }}" class="btn btn-default navbar-right">N-triples</a>
          <a type="button" href="{{ queryBaseUrl + 'ttl' }}" class="btn btn-default navbar-right">Turtle</a>
          <a type="button" href="{{ queryBaseUrl + 'trig' }}" class="btn btn-default navbar-right">TriG</a>
          <a type="button" href="{{ queryBaseUrl + 'jsonld' }}" class="btn btn-default navbar-right">JSON-LD</a>
        </span>
      </div>
    </div>
    <div class="row" id="queryDetails" v-if="show" transition="expand">
      <div class="col-md-12">
        <div class="well well-sm queryName">
          {{ query.name }}
        </div>
      </div>
      <div class="col-md-6">
        <ul class="list-group">
          <li class="list-group-item">
            <span class="badge">{{ query.endpoint }}</span>
            Endpoint URL
          </li>
        </ul>
      </div>
      <div class="col-md-3">
        <ul class="list-group">
          <li class="list-group-item">
            <span class="badge">{{ query.author }}</span>
            Author
          </li>
        </ul>
      </div>
      <div class="col-md-3">
        <ul class="list-group">
          <li class="list-group-item">
            <span class="badge">{{ modificationDate }}</span>
            Last update
          </li>
        </ul>
      </div>
      <div class="col-md-8 col-md-offset-2">
        <div class="well" id="text">
          {{{ queryText }}}
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 col-md-offset-4 well well-sm view" v-bind:class="{ 'error': message.error}" v-if="message.text !== ''" id="terminal">
        {{ message.text }}
      </div>
      <div id="results">
        <results></results>
      </div>
    </div>
  </div>
</template>

<style type="scss">
  #terminal.view {
    margin-top: 100px;
  }
  .actions a:hover,.actions a:focus {
    text-decoration: none;
  }
  div.btn-group > a.dropdown-toggle {
    padding: 16.72px;
  }
  #terminal {
    font-size: 0.8em;
    font-family: monospace;
    &.error {
      border: solid rgb(217, 83, 79) 4px;
    }
    &.new {
      margin-left: -15px;
      margin-right: -15px;
    }
  }
#queryDetails .badge {
  font-size: 17px;
}
  .expand-transition {
    transition: all .3s ease;
    overflow: hidden;
    max-height: 2000px;
  }

  .expand-enter, .expand-leave {
  max-height: 0;
  opacity: 0;
}
.queryName {
  font-size: 22px
}
#text {
  font-size: 90%;
}

</style>

<script>
import functions from './../lib/functions.js'
import Results from './Results.vue'
import { getMessage } from '../lib/getters.js'
import { getQuery } from '../lib/getters.js'
import { getQueryMetadata } from '../lib/actions.js'
import { getQueryResults } from '../lib/actions.js'

export default {
	el () {
    return "#new"
	},
	components : {
    Results
  },
  data () {
    return {
      results: {
        data: {},
        type: ""
      },
      show: false
    }
  },
  computed: {
    queryBaseUrl: function () {
      var params = this.$route.params;
      var url = siteRootUrl + "/api/" + params.type + "/" + params.slug + ".";
      return url;
    },
    modificationDate: function () {
      var unformattedDate = "";
      if (this.query.modificationDate) {
        if (typeof this.query.modificationDate === "string") {
          unformattedDate = this.query.modificationDate;
        } else  {
          unformattedDate = this.query.modificationDate[0];
        }
        return unformattedDate;
      }
    },
    queryText: function () {
      var query = "";
      if (this.query.query) {
        query = this.query.query
            .replace("<","&lt;")
            .replace(/\n/g,"<br>")
            .replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;");
        console.log(query);
        return query;
      }
    }
  },
  vuex: {
   getters: {
     // note that you're passing the function itself, and not the value 'getCount()'
     message: getMessage,
     query: getQuery
   },
   actions: {
     getQueryMetadata: getQueryMetadata,
     getQueryResults: getQueryResults
   }
  },
  methods: {
    goTo: function (name) {
      this.$route.router.go({name: name, params : {
        type: this.$route.params.type,
        slug: this.$route.params.slug
        }
      })
    },
    showDetails: function () {
      this.show = !this.show;
    }
  },
  created: function () {
      var type = this.$route.params.type;
      var name = this.$route.params.slug;
      var accept = (type === "tables") ? "application/sparql-results+json" : "application/ld+json";
      var options = {
        scheme : app.config.public.scheme,
        hostname: app.config.public.hostname,
        port: app.config.public.port,
        path: "/api/" + type + "/" + name,
        method: "GET",
        headers: {
          "accept" : accept
        }
      };
      this.getQueryMetadata(type,name);
      this.getQueryResults(options);
    }
  }
</script>
