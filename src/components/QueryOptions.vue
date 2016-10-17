   <template>
     <div>
       <form class="form-horizontal">
        <fieldset>
          <div class="form-group">
            <label for="name" class="control-label">Name *</label>
            <input class="form-control input-sm" title="The name of the query." v-model="thisQueryName" placeholder="Name" type="text" v-on:keyup="updateSlug">
          </div>
          <div class="form-group">
            <label for="author" class="control-label">Author</label>
            <input class="form-control input-sm" title="Your name or email or nothing." v-model="thisQueryAuthor" placeholder="Author" type="text">
          </div>
          <div class="form-group">
          <div class="radio">
            <label>
              <input v-model="thisQueryType" id="tables" value="tables" checked="" type="radio">
              Table query (SELECT)
            </label>
          </div>
          <div class="radio">
            <label>
              <input v-model="thisQueryType" id="graphs" value="graphs" type="radio">
              Graph query (DESCRIBE, CONSTRUCT or ASK )
            </label>
          </div>
        </div>
        <div class="form-group">
          <label for="weburl" class="control-label">Web URL</label>
            <input class="form-control input-sm" title="Go to Web URL." v-model="weburl" type="text" readonly>
          </div>
        </div>
        <div class="form-group">
          <label for="apiurl" class="control-label">API URL</label>
          <input class="form-control input-sm" title="Go to API URL." v-model="apiurl" type="text" readonly>
        </div>
  			<div class="form-group">
  				<label for="endpoint" class="control-label">SPARQL endpoint URL</label>
  				<input v-model="thisQueryEndpoint" placeholder="{{ defaultEndpointUrl }}" class="form-control input-sm" id="endpoint" title="The endpoint you want to query." type="text"/>
  			</div>

        </fieldset>
      </form>
			<div class="well well-sm new" v-bind:class="{ 'error': message.error}" id="terminal" v-if="message.text">
        {{{ message.text }}}
      </div>
    </div>
</template>

<script>
import slug from 'slug'
import sanitize from 'sanitize-filename'
import { updateQuery } from '../lib/actions.js'
import { updateForm } from '../lib/actions.js'
import { getQuery } from '../lib/getters.js'
import { getForm } from '../lib/getters.js'
import { getMessage } from '../lib/getters.js'

export default {
	el () {
    return "#left"
	},
  methods: {
    updateSlug: function() {
      this.form.slug = sanitize(slug(this.query.name).toLowerCase());
    },
    goTo (type) {
      this.$route.router.go({name: 'view', params : {
        type: this.form.type,
        slug: this.form.slug
        }
      })
    }
  },
  data () {
    return {
      slug: "",
      type: ""
    }
  },
  vuex: {
    getters: {
      query: getQuery,
      message: getMessage,
      form: getForm
    },
    actions: {
      updateQuery: updateQuery,
      updateForm: updateForm
    }
  },
  computed : {
    thisQueryAuthor: {
      get () {
        return this.query.author;
      },
      set (value) {
        var query = this.query;
        query.author = value;
        this.updateQuery(query);
      }
    },
    thisQueryName: {
      get () {
        return this.query.name;
      },
      set (value) {
        var query = this.query;
        query.name = value;
        this.updateQuery(query);
      }
    },
    thisQueryType: {
      get () {
        var result = (this.$route.params.type) ? this.$route.params.type : this.form.type
        return result;
      },
      set (value) {
        var form = this.form;
        form.type = value;
        this.updateForm(form);
      }
    },
    thisQuerySlug: {
      get () {
        return sanitize(slug(this.query.name).toLowerCase());
      }
    },
    thisQueryEndpoint: {
      get () {
        return this.query.endpoint;
      },
      set (value) {
        var query = this.query;
        query.endpoint = value;
        this.updateQuery(query);
      }
    },
    apiurl : function () {
      return siteRootUrl + "/api/" + this.thisQueryType + "/" + this.thisQuerySlug
    },
    weburl : function () {
      return siteRootUrl + "/#/view/" + this.thisQueryType + "/" + this.thisQuerySlug
    },
    defaultEndpointUrl : function () {
      return app.defaultEndpoint.replace("/localhost",app.config.public.hostname);
    }
  },
  created () {
    if (this.$route.params.type && this.$route.params.slug) {
      var params = this.$route.params;
      this.slug = params.slug;
      this.type = params.type;
    }
  }
}
</script>


<style lang="scss">
  .form-control::-webkit-input-placeholder { color: #999; }
  .form-control:-moz-placeholder { color: #999; }
  .form-control::-moz-placeholder { color: #999; }
  .form-control:-ms-input-placeholder { color: #999; }
  .input-group a.btn-default {
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
