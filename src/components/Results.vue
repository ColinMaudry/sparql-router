<template>
  <div v-bind:class="{ 'col-md-8': show, 'col-md-12': !show}">
    <table v-if="results.type === 'application/sparql-results+json'" class="table" id="tableResults">
      <tr>
        <th>#</th>
        <th v-for="variable in results.data.head.vars">{{ variable }}</th>
      </tr>
      <tr v-for="result in results.data.results.bindings">
        <td>{{ $index + 1 }}</td>
        <td v-for="column in result">
          {{ column.value }}
        </td>
      </tr>
    </table>
    <div v-if="results.type === 'application/ld+json'">
      <p class="col-md-4 col-md-offset-4">The query works! But no visualisation for graph results, yet.</p>
    </div>
  </div>
</template>

<style>
  #results p {
    margin-top: 100px;
    text-align: center;
  }
</style>

<script>
import { getResults } from '../lib/getters.js'
import { getShow } from '../lib/getters.js'

export default {
	el () {
    return "#results"
	},
  vuex: {
    getters: {
      results: getResults,
      show: getShow
    }
  },
  computed : {
    data : function () {
        return this.results.data
    }
  }
}

</script>
