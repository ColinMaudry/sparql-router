<template>
  <div class="row">
		<form class="form-horizontal" name="query-form" >
		<div id="left" class="col-md-4">
    	<query-options :parent-form.sync="form"></query-options>
		</div>
		<div id="right" class="col-md-7 col-md-offset-1">
	    <query-text :parent-form.sync="form"></query-text>
      <div class="form-group">
        <button type="button" v-on:click="sendForm" class="btn btn-primary navbar-right">Create</button>
        <button type="button" v-on:click="sendForm" class="btn btn-default navbar-right">Test</button>
      </div>
		</div>
	</form>
  </div>
</template>

<script>
import QueryOptions from './QueryOptions.vue'
import QueryText from './QueryText.vue'
import http from 'http'

export default {
	el () {
    return "#new"
	},
	components : {
    QueryOptions,
    QueryText
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
      }
    }
  },
  methods: {
    sendForm () {
      var options = {
        hostname: "localhost",
        port: app.port,
        path: "/api/" + this.form.type + "/" + this.form.slug,
        method: "PUT",
        headers: {
          "content-type": "application/json"
        }
      };
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
    						console.log(res.statusCode);
    					} else {
    						throw new Error ("There was an error (" + res.statusCode + ") sending the query:\n" + result + ".\n");
    					}
    			})
    		});
    		req.on('error', (e) => {
    				throw new Error ("There was an error sending the form data: " + e.message + ".\n");
    		});
    		req.write(JSON.stringify(this.form.query));
    		req.end();
    }
  }

}
</script>
