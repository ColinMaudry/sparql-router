<template>
      <fieldset>
        <div class="form-group">
          <label for="text" class="control-label">Query</label>
          <textarea v-model="query.query" class="form-control input-sm" rows="20" id="text">

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
export default {
	el () {
    return "#right"
	},
	components : {
  },
  data () {
    return {
      query: {
        query: "select * where {\n\
    ?s ?p ?o\n\
}\n\
limit 10"
      }
	   }
    }
  }

</script>
