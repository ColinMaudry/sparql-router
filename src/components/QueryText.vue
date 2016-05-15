<template>
      <fieldset>
        <div class="form-group">
          <label for="text" class="control-label">Query</label>
          <textarea v-model="text" class="form-control input-sm" rows="20" id="text">

</textarea>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary navbar-right">Create</button>
          <button type="submit" class="btn btn-default navbar-right">Test</button>
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
			text: "# These values may be used later to make proper metadata. No line break, please.\n\
# author:\n\
# description:\n\
select ?s ?p ?o where {\n\
	?s ?p ?o\n\
}\n\
limit 5"
	}
    }
  }

</script>
