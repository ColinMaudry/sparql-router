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
          </div>
        </div>
        <div class="form-group">
          <label for="weburl" class="control-label">Web URL</label>
          <div class="input-group">
            <input class="form-control input-sm" title="Go to Web URL." v-model="weburl" type="text" readonly>
            <span class="input-group-btn">
             <a class="btn-sm btn-default" type="button" href="{{ weburl }}" target="_blank">⇨</a>
           </span>
          </div>
        </div>
        <div class="form-group">
          <label for="apiurl" class="control-label">API URL</label>
          <input class="form-control input-sm" title="Go to API URL." v-model="apiurl" type="text" readonly>
        </div>
  			<div class="form-group">
  				<label for="endpoint" class="control-label">SPARQL endpoint URL</label>
  				<input v-model="parentForm.query.endpoint" placeholder="{{ defaultEndpointUrl }}" class="form-control input-sm" id="endpoint" title="The endpoint you want to query." type="text"/>
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
    },
    goTo (type) {
      this.$route.router.go({name: 'view', params : {
        type: this.form.type,
        slug: this.form.slug
        }
      })
    }
  },
  computed : {
    apiurl : function () {
      return siteRootUrl + "/api/" + this.parentForm.type + "/" + this.parentForm.slug
    },
    weburl : function () {
      return siteRootUrl + "/#/view/" + this.parentForm.type + "/" + this.parentForm.slug
    },
    defaultEndpointUrl : function () {
      return app.defaultEndpoint.replace("/localhost",app.config.public.hostname);
    }

  }

}
</script>


<style lang="scss">
  .form-control::-webkit-input-placeholder { color: #999; }
  .form-control:-moz-placeholder { color: #999; }
  .form-control::-moz-placeholder { color: #999; }
  .form-control:-ms-input-placeholder { color: #999; }
  a.btn-default {
  font-size: 16px;
  font-weight: bold;
  &:hover,&:focus {
    text-decoration: none;
  }
}
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
