import Vue from 'vue'
import VueRouter from 'vue-router'
import tableEdit from '../views/tableEdit'
import view from '../views/view1';
Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'tableEdit',
    component: tableEdit
  },
  {
    path: '/douya',
    name: 'dy',
    component: view
  }
]

const router = new VueRouter({
  routes
})

export default router
