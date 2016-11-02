<template>
  <div id="queryDetails" v-if="show && !message.error" v-bind:class="{ 'col-md-3': show}">
    <fieldset>
      <div class="form-group">
        <label for="name" class="control-label">Name</label>
        <input id="name" class="form-control input-lg" title="The name of the query." v-model="query.name" type="text" readonly>
      </div>
      <div class="form-group">
        <label for="author" class="control-label">Author</label>
        <input class="form-control" title="Author of the query" id="author" v-model="query.author" type="text" readonly>
      </div>
      <div class="well" id="text">
        {{{ queryText }}}
      </div>
      <div class="form-group">
        <label for="endpoint" class="control-label">Endpoint URL</label>
        <input class="form-control" title="The URL of the SPARQL endpoint for this query" id="author" v-model="query.endpoint" type="text" readonly>
      </div>
      <div class="form-group">
        <label for="modification" class="control-label">Last modification</label>
        <div class="well-sm well form-control" title="The date and time when the query text was modified for the last time" id="modification">{{ modificationDate }}</div>
      </div>

    </fieldset>
  </div>

</template>

<style type="scss">
#queryDetails .badge {
  font-size: 17px;
}
  .expand-transition {
    transition: all .15s ease;
    overflow: hidden;
    width: 2000px;
  }

  .expand-enter, .expand-leave {
  max-height: 0;
  opacity: 0;
}
.queryName {
  font-size: 22px;
}
#text {
  font-size: 80%;
}
#modification {
  background-color: #fff;
}

div.btn-group > a.dropdown-toggle {
  padding: 16.72px;
}
</style>

<script>
import { getQuery } from '../lib/getters.js'
import { getShow } from '../lib/getters.js'
import { getForm } from '../lib/getters.js'
import { getMessage } from '../lib/getters.js'


export default {
  el () {
    return "#details"
  },
  computed: {
    modificationDate: function () {
      var unformattedDate = "";
      if (this.query.modificationDate) {
        if (typeof this.query.modificationDate === "string") {
          unformattedDate = this.query.modificationDate;
        } else  {
          unformattedDate = this.query.modificationDate[0];
        }
        return unformattedDate;
      }
    },
    queryText: function () {
      var query = "";
      if (this.query.query) {
        query = this.query.query
            .replace(/</g,"&lt;")
            .replace(/\n/g,"<br>")
            .replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;");
        return query;
      }
    }
  },
  vuex: {
   getters: {
     query: getQuery,
     form: getForm,
     show: getShow,
     message: getMessage
   }
 },
methods: {
  goTo: function (name) {
    this.$route.router.go({name: name, params : {
      type: this.$route.params.type,
      slug: this.$route.params.slug
      }
    })
  }
}
}
</script>
