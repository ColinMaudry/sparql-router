<template>
  <div id="app">
  <div class="navbar navbar-default navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <a href="../" class="navbar-brand">Wikidata router</a>
          <button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
        </div>
        <div class="navbar-collapse collapse" id="navbar-main">
          <ul class="nav navbar-nav navbar-right">
            <li class="dropdown">
             <a class="dropdown-toggle" data-toggle="dropdown" href="#" id="themes">Source <span class="caret"></span></a>
             <ul class="dropdown-menu" aria-labelledby="source-code">
               <li><a href="https://github.com/ColinMaudry/sparql-router" target="_blank">API engine</a></li>
               <li><a href="https://github.com/ColinMaudry/sparql-router-ui" target="_blank">Web app</a></li>
             </ul>
           </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="container">
      <new-query></new-query>
    </div>
  </div>

</template>

<script>
import NewQuery from './components/NewQuery.vue'

export default {
  components: {
    NewQuery
  }
}
</script>

<style>
  body {
    padding-top: 60px;
  }
</style>
