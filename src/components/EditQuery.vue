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
          <button type="button" v-on:click="saveQueryAndGo(query,form.type,form.slug)" class="btn btn-primary navbar-right">Save</button>
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
import { saveQuery } from '../lib/actions.js'
import { testQuery } from '../lib/actions.js'
import { updateForm } from '../lib/actions.js'
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
     saveQuery: saveQuery,
     testQuery: testQuery,
     showDetails: showDetails,
     updateForm: updateForm
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
  methods: {
    saveQueryAndGo: function(query,type,slug) {
      console.log("slug: " + slug);
      saveQuery(this.$store,query,type,slug);
    }
  },
  created: function () {
      var form = {};
      form.type = this.$route.params.type;
      form.slug = this.$route.params.slug;
      this.updateForm(form);
      var accept = (form.type === "tables") ? "application/sparql-results+json" : "application/ld+json";
      var options = {
        scheme : app.config.public.scheme,
        hostname: app.config.public.hostname,
        port: app.config.public.port,
        path: "/api/" + form.type + "/" + form.slug,
        method: "GET",
        headers: {
          "accept" : accept
        }
      };
      showDetails(this.$store,false,"edit");
      this.getQueryMetadata(form.type,form.slug);
      this.sendHTTPRequest(options,getQueryResults);

    }

}
</script>
