<template>
  <div class="actions">
    <button id="newButton" type="button" class="btn btn-success navbar-left" v-on:click="goTo('new')">New</button>
    <button id="editButton" v-if="$route.name === 'view'" type="button" class="btn btn-primary navbar-left" v-on:click="goTo('edit')">Edit</button>
    <button id="viewButton" v-if="$route.name === 'edit'" type="button" class="btn btn-default navbar-left" v-on:click="goTo('view')">View</button>
    <button id="detailsButton" v-if="$route.name === 'view'" type="button" v-on:click="showDetails(show)" class="btn btn-default navbar-left">{{(show) ? "-" : "+" }} Details</button>
    <button id="deleteButton" v-if="$route.name === 'view' || $route.name === 'edit'" type="button" v-on:click="deleteQueryAndGo($route.params.type,$route.params.slug)" class="btn btn-danger navbar-left">Delete</button>
    <span v-if="$route.params.type === 'tables'">
      <a type="button" href="{{ queryBaseUrl + 'json' }}" class="btn btn-default navbar-right">JSON</a>
      <a type="button" href="{{ queryBaseUrl + 'xml' }}" class="btn btn-default navbar-right">XML</a>
      <a type="button" href="{{ queryBaseUrl + 'csv' }}" class="btn btn-default navbar-right">CSV</a>
    </span>
    <span v-if="$route.params.type === 'graphs'">
      <div class="btn-group navbar-right" >
        <a href="{{ queryBaseUrl + 'xml' }}" class="btn btn-default">XML</a>
        <a href="#" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></a>
        <ul class="dropdown-menu">
          <li><a href="{{ queryBaseUrl + 'rdf' }}">RDF/XML</a></li>
          <li><a href="{{ queryBaseUrl + 'trix' }}">TriX</a></li>
        </ul>
      </div>
      <a type="button" href="{{ queryBaseUrl + 'nt' }}" class="btn btn-default navbar-right">N-triples</a>
      <a type="button" href="{{ queryBaseUrl + 'ttl' }}" class="btn btn-default navbar-right">Turtle</a>
      <a type="button" href="{{ queryBaseUrl + 'trig' }}" class="btn btn-default navbar-right">TriG</a>
      <a type="button" href="{{ queryBaseUrl + 'jsonld' }}" class="btn btn-default navbar-right">JSON-LD</a>
    </span>
  </div>

</template>

<style type="scss">
.actions a:hover,.actions a:focus {
  text-decoration: none;
}
div.btn-group > a.dropdown-toggle {
  padding: 16.72px;
}
</style>

<script>
import { deleteQuery } from '../lib/actions.js'
import { showDetails } from '../lib/actions.js'
import { getShow } from '../lib/getters.js'

export default {
  el () {
    return "#actionBar"
  },
  computed: {
    queryBaseUrl: function () {
      var params = this.$route.params;
      var url = siteRootUrl + "/api/" + params.type + "/" + params.slug + ".";
      return url;
    }
  },
  vuex: {
    actions: {
    deleteQuery: deleteQuery,
    showDetails: showDetails
  },
  getters: {
    show: getShow
  }}
   ,
methods: {
  goTo: function (name) {
    this.$route.router.go({name: name, params : {
      type: this.$route.params.type,
      slug: this.$route.params.slug
      }
    })
  },
  deleteQueryAndGo: function(type,slug) {
    deleteQuery(this.$store,type,slug,this.$router);
  },

}
}
</script>
