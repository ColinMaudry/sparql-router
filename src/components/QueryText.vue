<template>
      <fieldset>
        <div class="form-group">
          <label for="text" class="control-label">Query *</label>
          <textarea v-model="parentForm.query.query" class="form-control input-sm" rows="20" id="text">
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
export default {
	el () {
    return "#right"
	},
  props : ["parentForm"]
  }

</script>
