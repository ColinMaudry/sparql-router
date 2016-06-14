<template>
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
</template>

<script>
import QueryOptions from './QueryOptions.vue'
import QueryText from './QueryText.vue'
import Results from './Results.vue'
import http from 'http'

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
          author: "",undefined
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
          "content-type": "application/json"
        }
      };
      this.sendQuery(options);
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
      this.sendQuery(options);
    },
    sendQuery (options) {
      console.log(JSON.stringify(options,null,2));
      console.log(JSON.stringify(this.form.query,null,2));
      var result = "";
      var req = http.request(options, (res) => {
    			res.setEncoding('utf8');
    			res.on('data', (data) => {
    				result += data;
    			});
    			res.on('end', () => {
    					if (res.statusCode < 300) {
                this.results.type = this.stringBefore(res.headers["content-type"],';').replace(' ','');
                this.message.error = false;

                if (results.type = /json/) {
                  this.results.data = JSON.parse(result);
                  $(document).ready(function(){
                    $('#tableResults').DataTable();
                  });
                  console.log(JSON.stringify(this.results,null,2));
                } else {
                  result = result.replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/\t/g,'  ');
                  this.message.text = result;
                }
    					} else {
                result = result.replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/\t/g,'  ');
                this.message.error = true;
                this.message.text = result;
    					}
    			})
    		});
    		req.on('error', (e) => {
    				throw new Error ("There was an error sending the form data: " + e.message + ".\n");
    		});
    		req.write(JSON.stringify(this.form.query));
    		req.end();
    },
    stringBefore (str, sep) {
     var i = str.indexOf(sep);

     if(i > 0)
      return  str.slice(0, i);
     else
      return str;
    }
  }

}
</script>
