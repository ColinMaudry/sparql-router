<template>
  <textarea id="text" v-model="thisQueryText">
select * where {
  ?s ?p ?o
}
limit 10
</textarea>
</template>
<style>
  .yasqe div.CodeMirror, #text {
    font-family: "Consolas","Monaco","Ubuntu Mono",monospace;
  }
  .yasqe div.CodeMirror {
    height: 390px;
  }
  .yasqe .yasqe_share {
    display: none;
    }
  .yasqe .CodeMirror-fullscreen {
    margin-top: 40px;
    margin-bottom: 30px;
  }
</style>
<script>
import { getQuery } from '../lib/getters.js'
import { getQueryMetadata } from '../lib/actions.js'
import { updateQuery } from '../lib/actions.js'
var YASQE = require('./../vendor/yasqe/src/main.js')

export default {
  data () {
    return {
      content: ""
    }
  },
	el () {
    return "#right"
	},
  vuex: {
    getters: {
     query: getQuery
   },
   actions: {
     updateQuery: updateQuery
   }
  },
  computed: {
    thisQueryText () {
        return this.query.query;
    }
  },
  ready () {
      var _this = this;
      var value = _this.query.query || "select * where {\n       ?s ?p ?o\n      }\n      limit 10";
      this.yasqe = YASQE.fromTextArea(this.$el);
      console.log(value);
      this.yasqe.setValue(value);
      var query = _this.query;
      query.query = this.yasqe.getValue();
      _this.updateQuery(query);
      this.yasqe.on('change', function(cm) {
        var query = _this.query;
        query.query = cm.getValue();
        _this.updateQuery(query);
      })
  },
  watch: {
    'thisQueryText': function (newVal,oldVal) {
      const editor_value = this.yasqe.getValue();
      if (newVal !== editor_value) {
         this.yasqe.setValue(newVal);
        }
      }
    }
}
</script>
