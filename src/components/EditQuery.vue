<template>
  <div class="container" id="edit">
    <div class="row">
      <div id="actionBar">
        <action-bar></action-bar>
      </div>
    </div>
    <div class="row">
      <form class="form-horizontal" name="query-form" >
      <div id="left" class="col-md-4">
        <query-options></query-options>
      </div>
      <div id="right" class="col-md-7 col-md-offset-1">
        <query-text :parent-form.sync="form"></query-text>
        <div class="form-group">
          <button type="button" v-on:click="updateQuery(type,slug)" class="btn btn-primary navbar-right">Save</button>
          <button type="button" v-on:click="testQuery(query,type)" class="btn btn-default navbar-right">Test</button>
        </div>
      </div>
    </form>
    </div>
    <div class="row">
      <div id="results">
        <results></results>
      </div>
    </div>
  </div>
</template>

<script>
import QueryOptions from './QueryOptions.vue'
import QueryText from './QueryText.vue'
import ActionBar from './ActionBar.vue'
import Results from './Results.vue'
import functions from './../lib/functions.js'
import { getQueryMetadata } from '../lib/actions.js'
import { getQueryResults } from '../lib/actions.js'
import { sendHTTPRequest } from '../lib/actions.js'
import { showDetails } from '../lib/actions.js'
import { writeQuery } from '../lib/actions.js'
import { testQuery } from '../lib/actions.js'
import { getForm } from '../lib/getters.js'
import { getQuery } from '../lib/getters.js'
import { getShow } from '../lib/getters.js'

export default {
	el () {
    return "#new"
	},
	components : {
    QueryOptions,
    ActionBar,
    QueryText,
    Results
  },
  vuex: {
   actions: {
     getQueryMetadata: getQueryMetadata,
     getQueryResults: getQueryResults,
     sendHTTPRequest: sendHTTPRequest,
     updateQuery: writeQuery,
     testQuery: testQuery,
     showDetails: showDetails
   },
   getters: {
     form: getForm,
     query: getQuery,
     show: getShow
   }
  },
  computed: {
    type: function () {
      return this.$route.params.type;
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
      showDetails(this.$store,this.show);
      this.getQueryMetadata(type,name);
      this.sendHTTPRequest(options,getQueryResults);

    }

}
</script>
