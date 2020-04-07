import Vue from 'vue'
import VueRouter from 'vue-router'
import tableEdit from '../views/tableEdit'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'tableEdit',
    component: tableEdit
  },

]

const router = new VueRouter({
  routes
})

export default router
