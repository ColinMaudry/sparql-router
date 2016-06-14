<template>
  <p>Results</p>
  <table v-if="parentResults.type === 'application/sparql-results+json'" class="table" id="tableResults">
    <tr>
      <th v-for="variable in parentResults.data.head.vars">{{ variable }}</th>
    </tr>
    <tr v-for="result in parentResults.data.results.bindings">
      <td v-for="column in result">
        {{ column.value }}
      </td>
    </tr>
  </table>
  <div v-if="parentResults.type === 'application/ld+json'">

  </div>
</template>

<style>

</style>

<script>
export default {
	el () {
    return "#results"
	},
  props : ["parentResults"],
  computed : {
    data : function () {
        return this.parentResults.data
    }
  }
}

</script>
