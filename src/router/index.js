import Vue from 'vue'
import Router from 'vue-router'
import Inicio from '@/views/Inicio.vue'
import Dashboard from '@/views/Dashboard.vue'
import Herramientas from '@/views/Herramientas.vue'
import PromptingLab from '@/views/PromptingLab.vue'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '*',
    redirect: '/'
  }, {
    path: '/',
    name: 'Inicio',
    component: Inicio
  }, {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  }, {
    path: '/herramientas',
    name: 'Herramientas',
    component: Herramientas
  }, {
    path: '/prompting-lab',
    name: 'PromptingLab',
    component: PromptingLab
  },
]
})
