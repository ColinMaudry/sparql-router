<template>
      <fieldset>
        <div class="form-group">
          <label for="text" class="control-label">Query *</label>
          <yasqe></yasqe>
        </div>
      </fieldset>
</template>

<script>
import Yasqe from './Yasqe.vue'

export default {
  components: {
    Yasqe
  }
}
</script>
