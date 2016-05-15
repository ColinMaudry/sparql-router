<template>
  <div class="row">
		<form class="form-horizontal" name="query">
		<div id="left" class="col-md-4">
    	<query-options></query-options>
		</div>
		<div id="right" class="col-md-7 col-md-offset-1">
	    <query-text></query-text>
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
      // Note: modifying `msg` below will not cause changes to occur with
      // hot-reload. As reloaded components preserve their initial state,
      // modifying these values will have no effect.
      msg: 'Hello World!'
    }
  }
}
</script>
