<template>
      <fieldset>
        <div class="form-group">
          <label for="text" class="control-label">Query *</label>
          <textarea v-model="thisQueryText" class="form-control input-sm" rows="20" id="text">
select * where {
    ?s ?p ?o
}
limit 10
</textarea>
        </div>
      </fieldset>
</template>

<style>
  #text {
    font-family: monospace;
  }
</style>

<script>
import { getQuery } from '../lib/getters.js'
import { getQueryMetadata } from '../lib/actions.js'
import { updateQuery } from '../lib/actions.js'

export default {
	el () {
    return "#right"
	},
  vuex: {
    getters: {
     query: getQuery
   },
   actions: {
     updateQuery: updateQuery
   }
  },
  computed: {
    thisQueryText: {
      get () {
        return this.query.query;
      },
      set (value) {
        var query = this.query;
        query.query = value
        this.updateQuery(query);
      }
    }
  }
}

</script>
