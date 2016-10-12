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
          <button type="button" v-on:click="createQueryAndGo(query,form.type,form.slug)" class="btn btn-primary navbar-right">Create</button>
          <button type="button" v-on:click="testQuery(query,form.type)" class="btn btn-default navbar-right">Test</button>
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
import { createQuery } from '../lib/actions.js'
import { testQuery } from '../lib/actions.js'
import { getQuery } from '../lib/getters.js'
import { getForm } from '../lib/getters.js'


export default {
	el () {
    return "#new"
	},
	components : {
    QueryOptions,
    QueryText,
    Results
  },
  vuex: {
   actions: {
     getQueryMetadata: getQueryMetadata,
     testQuery: testQuery,
     createQuery: createQuery
   },
   getters: {
     form: getForm,
     query: getQuery
   }
 },
 methods: {
   createQueryAndGo : function (query,type,slug) {
     createQuery(this.$store,query,type,slug,this.$route.router);

       }
     }
   }
</script>
