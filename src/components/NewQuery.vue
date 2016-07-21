<template>
  <div class="container">
    <div class="row">
  		<form class="form-horizontal" name="query-form" >
  		<div id="left" class="col-md-4">
      	<query-options></query-options>
  		</div>
  		<div id="right" class="col-md-7 col-md-offset-1">
  	    <query-text></query-text>
        <div class="form-group">
          <button type="button" v-on:click="createQuery" class="btn btn-primary navbar-right">Create</button>
          <button type="button" v-on:click="testQuery" class="btn btn-default navbar-right">Test</button>
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
import Results from './Results.vue'
import functions from './../lib/functions.js'
import { getQueryMetadata } from '../lib/actions.js'
import { writeQuery } from '../lib/actions.js'
import { testQuery } from '../lib/actions.js'


export default {
	el () {
    return "#new"
	},
	components : {
    QueryOptions,
    QueryText,
    Results
  },
  // methods: {
  //   createQuery () {
  //     var options = {
  //       scheme : app.config.public.scheme,
  //       hostname: app.config.public.hostname,
  //       port: app.config.port,
  //       path: "/api/" + this.type + "/" + this.slug,
  //       method: "PUT",
  //       headers: {
  //         "content-type": "application/json",
  //         "accept" : "*/*"
  //       }
  //     };
  //     functions.sendQuery(options,this.query,this.results,this.message);
  //   },
  //   testQuery () {
  //     var accept = (this.form.type === "tables") ? "application/sparql-results+json" : "text/turtle; q=0.2, application/ld+json";
  //     var options = {
  //       scheme : app.config.public.scheme,
  //       hostname: app.config.public.hostname,
  //       port: app.config.public.port,
  //       path: "/api/sparql",
  //       method: "POST",
  //       headers: {
  //         "content-type": "application/json",
  //         "accept" : accept
  //       }
  //     };
  //     functions.sendQuery(options,this.query,this.results,this.message);
  //   }
  // },
  vuex: {
   actions: {
     getQueryMetadata: getQueryMetadata,
     update: writeQuery,
     testQuery: testQuery
   }
  }

}
</script>
