import Boostrap from './vendor/bootstrap.js'
import VueRouter from 'vue-router'
import Vue from 'vue'
import NewQuery from './components/NewQuery.vue'
import ViewQuery from './components/ViewQuery.vue'
import EditQuery from './components/EditQuery.vue'
import About from './components/About.vue'
import Feedback from './components/Feedback.vue'
import store from './lib/store.js'

Vue.use(VueRouter);

const App = Vue.extend({
  store: store
});
var router = new VueRouter({
  hashbang: false
});

router.map({
    '/': {
        component: NewQuery,
        name : "new"
    },
    '/view/:type/:slug' : {
      component: ViewQuery,
      name: 'view'
    },
    '/edit/:type/:slug' : {
      component: EditQuery,
      name: 'edit'
    },
    '/about' : {
      component: About,
      name: 'about'
    },
    '/feedback' : {
      component: Feedback,
      name: 'feedback'
    }
});
router.mode = 'html5';
router.redirect({
  '*': '/'
})


router.start(App, '#app');
