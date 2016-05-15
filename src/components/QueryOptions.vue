<template>
    <form class="form-horizontal">
      <fieldset>
        <div class="form-group">
          <label for="name" class="control-label">Name</label>
          <input class="form-control input-sm" title="The name of the query." v-model="url" placeholder="Name" type="text">
        </div>
        <div class="form-group">
        <div class="radio">
          <label>
            <input name="type" id="tables" value="tables" checked="" type="radio">
            Table query (SELECT)
          </label>
        </div>
        <div class="radio">
          <label>
            <input name="type" id="graphs" value="graphs" type="radio">
            Graph query (DESCRIBE, CONSTRUCT or ASK )
          </label>
          <span class="help-block">URL: {{ url }}</span>
        </div>
      </div>
			<div class="form-group">
				<label for="endpoint" class="control-label">Endpoint URL</label>
				<input name="endpoint" class="form-control input-sm" id="endpoint" type="text" value="{{ endpoint }}"/>
			</div>

      </fieldset>
    </form>
		<div id="terminal">
			<terminal></terminal>
		</div>
</template>

<script>
import Terminal from './Terminal.vue'

export default {
	el () {
    return "#left"
	},
  components : {
    Terminal
  },
	data () {
    return {
			url: "test"
		}
  }
}
</script>
