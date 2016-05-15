<template>
  <div class="row">
    <query-options></query-options>
    <query-text></query-text>
  </div>
</template>

<script>
import QueryOptions from './QueryOptions.vue'
import QueryText from './QueryText.vue'

export default {
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
