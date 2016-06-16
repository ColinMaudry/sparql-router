import Boostrap from './vendor/bootstrap.js'
import VueRouter from 'vue-router'
import Vue from 'vue'
import NewQuery from './components/NewQuery.vue'
Vue.use(VueRouter);



/* eslint-disable no-new */
// new Vue({
//   el: 'body',
//   components: { App },
//   routes : {
//     '/new' : {
//       componentId: "App",
//       isDefault: true
//     }
//   }
// })

var App = Vue.extend({});
var router = new VueRouter()

router.map({
    '/': {
        component: NewQuery,
        name : "new"
    }
})

router.start(App, '#app');
