<template>
  <div class="row" id="queryDetails" v-if="show" transition="expand">
    <div class="col-md-12">
      <div class="well well-sm queryName" id="name">
        {{ query.name }}
      </div>
    </div>
    <div class="col-md-6">
      <ul class="list-group">
        <li class="list-group-item">
          <span class="badge">{{ query.endpoint }}</span>
          Endpoint URL
        </li>
      </ul>
    </div>
    <div class="col-md-3">
      <ul class="list-group">
        <li class="list-group-item" id="author">
          <span class="badge">{{ query.author }}</span>
          Author
        </li>
      </ul>
    </div>
    <div class="col-md-3">
      <ul class="list-group">
        <li class="list-group-item">
          <span class="badge">{{ modificationDate }}</span>
          Last update
        </li>
      </ul>
    </div>
    <div class="col-md-8 col-md-offset-2">
      <div class="well" id="text">
        {{{ queryText }}}
      </div>
    </div>

</template>

<style type="scss">
#queryDetails .badge {
  font-size: 17px;
}
  .expand-transition {
    transition: all .15s ease;
    overflow: hidden;
    max-height: 2000px;
  }

  .expand-enter, .expand-leave {
  max-height: 0;
  opacity: 0;
}
.queryName {
  font-size: 22px
}
#text {
  font-size: 90%;
}
div.btn-group > a.dropdown-toggle {
  padding: 16.72px;
}
</style>

<script>
import { getQuery } from '../lib/getters.js'
import { getShow } from '../lib/getters.js'
import { getForm } from '../lib/getters.js'

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
            .replace("<","&lt;")
            .replace(/\n/g,"<br>")
            .replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;");
        console.log(query);
        return query;
      }
    }
  },
  vuex: {
   getters: {
     query: getQuery,
     form: getForm,
     show: getShow
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
