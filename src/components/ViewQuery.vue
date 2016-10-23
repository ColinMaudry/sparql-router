<template>
  <div class="container-fluid" id="view">
    <div v-if="message.error != true" class="row">
      <div id="actionBar" class="col-md-8 col-md-offset-2">
        <action-bar></action-bar>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 col-md-offset-4 well well-sm view" v-bind:class="{ 'error': message.error}" v-if="message.text !== ''" id="terminal">
        {{{ message.text }}}
      </div>
      <div id="details">
        <query-details></query-details>
      </div>
      <div id="results" >
        <results></results>
      </div>
    </div>
  </div>
</template>

<style type="scss">
  #terminal.view {
    margin-top: 100px;
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
import ActionBar from './ActionBar.vue'
import QueryDetails from './QueryDetails.vue'
import { getMessage } from '../lib/getters.js'
import { getQueryMetadata } from '../lib/actions.js'
import { getQueryResults } from '../lib/actions.js'
import { sendHTTPRequest } from '../lib/actions.js'

export default {
	el () {
    return "#new"
	},
	components : {
    Results,
    ActionBar,
    QueryDetails
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
    }
  },
  vuex: {
   getters: {
     message: getMessage
   },
   actions: {
     getQueryMetadata: getQueryMetadata,
     getQueryResults: getQueryResults,
     sendHTTPRequest: sendHTTPRequest

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
      this.sendHTTPRequest(options,getQueryResults);
    }
  }
</script>
