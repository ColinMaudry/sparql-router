<template>
  <div class="container">
    <div class="row">
  		<form class="form-horizontal" name="query-form" >
  		<div id="left" class="col-md-4">
      	<query-options :parent-form.sync="form" :parent-message.sync="message"></query-options>
  		</div>
  		<div id="right" class="col-md-7 col-md-offset-1">
  	    <query-text :parent-form.sync="form"></query-text>
        <div class="form-group">
          <button type="button" v-on:click="createQuery" class="btn btn-primary navbar-right">Create</button>
          <button type="button" v-on:click="testQuery" class="btn btn-default navbar-right">Test</button>
        </div>
  		</div>
  	</form>
    </div>
    <div class="row">
      <div id="results">
        <results :parent-results="results"></results>
      </div>
    </div>
  </div>
</template>

<script>
import QueryOptions from './QueryOptions.vue'
import QueryText from './QueryText.vue'
import Results from './Results.vue'
import functions from './../lib/functions.js'


export default {
	el () {
    return "#new"
	},
	components : {
    QueryOptions,
    QueryText,
    Results
  },
  data () {
    return {
      form: {
        type: "tables",
        slug: "test",
        query : {
          query: "",
          name: "test",
          author: "",
          endpoint: ""
        }
      },
      results: {
        data: {},
        type: ""
      },
      message: {
        text: "...",
        error: false
      }
    }
  },
  methods: {
    createQuery () {
      var options = {
        hostname: "localhost",
        port: app.port,
        path: "/api/" + this.form.type + "/" + this.form.slug,
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "accept" : "*/*"
        }
      };
      functions.sendQuery(options,this.form.query,this.results,this.message);
      // this.$route.router.go({name: 'view', params : {
      //   type: this.form.type,
      //   slug: this.form.slug
      //   }
      // })
    },
    testQuery () {
      var accept = (this.form.type === "tables") ? "application/sparql-results+json" : "text/turtle; q=0.2, application/ld+json";
      var options = {
        hostname: "localhost",
        port: app.port,
        path: "/api/sparql",
        method: "POST",
        headers: {
          "content-type": "application/json",
          "accept" : accept
        }
      };
      functions.sendQuery(options,this.form,this.results,this.message);
    }
  }

}
</script>
