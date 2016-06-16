   <template>
     <div>
       <form class="form-horizontal">
        <fieldset>
          <div class="form-group">
            <label for="name" class="control-label">Name *</label>
            <input class="form-control input-sm" title="The name of the query." v-model="parentForm.query.name" placeholder="Name" type="text" v-on:keyup="updateSlug">
          </div>
          <div class="form-group">
            <label for="author" class="control-label">Author</label>
            <input class="form-control input-sm" title="Your name or email or nothing." v-model="parentForm.query.author" placeholder="Name" type="text">
          </div>
          <div class="form-group">
          <div class="radio">
            <label>
              <input v-model="parentForm.type" id="tables" value="tables" checked="" type="radio">
              Table query (SELECT)
            </label>
          </div>
          <div class="radio">
            <label>
              <input v-model="parentForm.type" id="graphs" value="graphs" type="radio">
              Graph query (DESCRIBE, CONSTRUCT or ASK )
            </label>
            <span class="help-block">WEB URL: {{ weburl }}</span>
            <span class="help-block">API URL: {{ url }}</span>
          </div>
        </div>
  			<div class="form-group">
  				<label for="endpoint" class="control-label">Endpoint URL</label>
  				<input v-model="parentForm.query.endpoint" class="form-control input-sm" id="endpoint" title="The endpoint you want to query." type="text"/>
  			</div>

        </fieldset>
      </form>
			<div class="well well-sm new" v-bind:class="{ 'error': parentMessage.error}" id="terminal">
        {{{ parentMessage.text }}}
      </div>
    </div>
</template>

<script>
import slug from 'slug'
import sanitize from 'sanitize-filename'

export default {
	el () {
    return "#left"
	},
  props: ['parentForm','parentMessage'],
  methods: {
    updateSlug: function() {
      this.parentForm.slug = sanitize(slug(this.parentForm.query.name).toLowerCase());
    }
  },
  computed : {
    url : function () {
      return siteRootUrl + "/api/" + this.parentForm.type + "/" + this.parentForm.slug
    },
    weburl : function () {
      return siteRootUrl + "/" + this.parentForm.type + "/" + this.parentForm.slug
    },

  }

}
</script>


<style lang="scss">
	#terminal {
		font-size: 0.8em;
		font-family: monospace;
		&.error {
			border: solid rgb(217, 83, 79) 4px;
		}
    &.new {
      margin-left: -15px;
      margin-right: -15px;
    }
	}
</style>
