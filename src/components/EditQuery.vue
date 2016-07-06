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
          <button type="button" v-on:click="updateQuery" class="btn btn-primary navbar-right">Save</button>
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
      results: {
        data: {},
        type: ""
      },
      message: {
        text: "...",
        error: false
      }
    }
  }
}
</script>
