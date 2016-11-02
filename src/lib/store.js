import Vue from 'vue'
import Vuex from 'vuex'

// Make vue aware of Vuex
Vue.use(Vuex)

// Create an object to hold the initial state when
// the app starts up
const state = {
  form: {
    slug: "",
    type: "tables"
  },
  query : {
    query: "",
    name: "",
    author: "",
    endpoint: ""
  },
  results: {
    data: {},
    type: ""
  },
  message: {
    text: "",
    error: false
  },
  showDetails: true,
  loading: false,
  elapsedTime: 0
}

// Create an object storing various mutations. We will write the mutation
const mutations = {
  QUERY (state,query) {
    state.query = query;
  },
  FORM (state,form) {
    state.form = form;
  },
  MESSAGE (state,message,error) {
    state.message.text = message ;
    state.message.error = error;
  },
  RESULTS (state,results) {
    state.results = results;
  },
  SHOWDETAILS (state,show) {
    state.showDetails = show;
  },
  LOADING (state,loading) {
    state.loading = loading;
  },
  ELAPSEDTIME (state,time) {
    state.elapsedTime = time;
  }
}

// Combine the initial state and the mutations to create a Vuex store.
// This store can be linked to our app.
export default new Vuex.Store({
  state,
  mutations
})
