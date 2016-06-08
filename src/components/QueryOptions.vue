   <template>
     <div>
       <form class="form-horizontal">
        <fieldset>
          <div class="form-group">
            <label for="name" class="control-label">Name *</label>
            <input class="form-control input-sm" title="The name of the query." v-model="parentQuery.name" placeholder="Name" type="text">
          </div>
          <div class="form-group">
            <label for="author" class="control-label">Author</label>
            <input class="form-control input-sm" title="Your name or email or nothing." v-model="parentQuery.author" placeholder="Name" type="text">
          </div>
          <div class="form-group">
          <div class="radio">
            <label>
              <input v-model="parentType" id="tables" value="tables" checked="" type="radio">
              Table query (SELECT)
            </label>
          </div>
          <div class="radio">
            <label>
              <input v-model="parentType" id="graphs" value="graphs" type="radio">
              Graph query (DESCRIBE, CONSTRUCT or ASK )
            </label>
            <span class="help-block">WEB URL: {{ weburl }}</span>
            <span class="help-block">API URL: {{ url }}</span>
          </div>
        </div>
  			<div class="form-group">
  				<label for="endpoint" class="control-label">Endpoint URL</label>
  				<input v-model="parentQuery.endpoint" class="form-control input-sm" id="endpoint" title="Your name or email or nothing." type="text" value="{{ endpoint }}"/>
  			</div>

        </fieldset>
      </form>
  		<div id="terminal">
  			<terminal>{{ message }}</terminal>
  		</div>
    </div>
</template>

<script>
import Terminal from './Terminal.vue'
import slugify from 'slugify'

export default {
	el () {
    return "#left"
	},
  components : {
    Terminal
  },
  props: ['parentQuery','parentType'],
  computed : {
    url : function () {
      return siteRootUrl + "/api/" + this.parentType + "/" + this.slug
    },
    weburl : function () {
      return siteRootUrl + "/" + this.parentType + "/" + this.slug
    },
    slug : function () {
      return slugify(this.parentQuery.name).toLowerCase()
    }
  }

}
</script>
