import { createRouter, createWebHistory } from 'vue-router';
import storeUser from "@/store";

import HomeView from '@/views/HomeView.vue';
import UserHomeView from "@/views/UserHomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: "/userhome",
      name: "UserHome",
      component: UserHomeView,
    }
  ]
})

// Check if the user is logged in 
const checkLogInState = async function () {
  if (storeUser.state.isAuthenticated === false) {
    await storeUser.dispatch("login");
  }
};

export default router
