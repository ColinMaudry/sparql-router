<template>
  <div class="row">
		<form class="form-horizontal" name="query-form" >
		<div id="left" class="col-md-4">
    	<query-options :parent-query="query" :parent-type.sync="type"></query-options>
		</div>
		<div id="right" class="col-md-7 col-md-offset-1">
	    <query-text></query-text>
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
      type: "tables",
      query : {
        name: "test",
        author: "",
        endpoint: ""
      }
    }
  },
  methods: {
    sendForm () {
      console.log(this.query.name);
    }
  }

}
</script>
