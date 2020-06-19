import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Poll from '../views/Poll.vue'
import NotFound from '../views/NotFound.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Polly' }
  },
  {
    path: '/poll',
    name: 'Poll',
    component: Poll,
    meta: { title: 'Polly' }
  },
  {
    path: '*',
    name: 'Not Found',
    component: NotFound,
    meta: { title: 'Page not found - Polly' }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
