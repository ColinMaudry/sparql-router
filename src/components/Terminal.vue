<template>
	<div class="well well-sm">
    Here go some messages to keep you informed of what's going on.
  </div>
</template>

<script>
</script>

<style lang="scss">
	#terminal {
		font-size: 0.8em;
		margin-left: -15px;
		margin-right: -15px;
		font-family: monospace;
		.error {
			border: solid rgb(217, 83, 79) 4px;
		}
	}
</style>

<script>
export default {
	el () {
    return "#terminal"
	},
  data () {
    return {

    }
  }
}
</script>
