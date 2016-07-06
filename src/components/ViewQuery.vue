<template>
  <div class="container-fluid">
    <div v-if="message.error === false" class="row">
      <div class="col-md-8 col-md-offset-2 actions">
        <!-- <button type="button" v-on:click="" class="btn btn-default navbar-left">+ Details</button> -->
        <button type="button" class="btn btn-primary navbar-left" v-on:click="goTo('edit')">Edit</button>         <span v-if="$route.params.type === 'tables'">
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
    <div class="row">
      <div class="col-md-4 col-md-offset-4 well well-sm view" v-bind:class="{ 'error': message.error}" v-if="message.text !== ''" id="terminal">
        {{{ message.text }}}
      </div>
      <div id="results">
        <results :parent-results="results"></results>
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
</style>

<script>
import functions from './../lib/functions.js'
import Results from './Results.vue'
import { getMessage } from '../lib/getters.js'
import { getQueryMetadata } from '../lib/actions.js'

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
      }
    }
  },
  computed: {
    queryBaseUrl: function () {
      var params = this.$route.params;
      var url = siteRootUrl + "/api/" + params.type + "/" + params.slug + ".";
      return url;
    }
  },
  vuex: {
   getters: {
     // note that you're passing the function itself, and not the value 'getCount()'
     message: getMessage
   },
   actions: {
     getQueryMetadata: getQueryMetadata
   }
  },
  methods: {
  goTo: function (name) {
    this.$route.router.go({name: name, params : {
      type: this.$route.params.type,
      slug: this.$route.params.slug
      }
    })
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
      functions.sendQuery(options,{},this.results,this.message);
    }
  }
</script>
