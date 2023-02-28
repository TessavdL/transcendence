import { createRouter, createWebHistory } from 'vue-router';
import storeUser from "@/store";

import HomeView from '@/views/HomeView.vue';
import GameView from "@/views/GameView.vue";
import ChatView from "@/views/ChatView.vue";
import ProfileView from "@/views/ProfileView.vue";
import LogoutView from "@/views/LogoutView.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/game',
      name: 'Game',
      component: GameView
    },
    {
      path: '/chat',
      name: 'Chat',
      component: ChatView
    },
    {
      path: '/profile',
      name: 'Profile',
      component: ProfileView
    },
    {
      path: '/logout',
      name: 'Logout',
      component: LogoutView
    },
  ]
})

// Check if the user is logged in 
const checkLogInState = async function () {
  if (storeUser.state.isAuthenticated === false) {
    await storeUser.dispatch("login");
  }
};

router.beforeEach(async (to) => {
  // if (to.name !== "UnAuthorized" && to.name !== "2fAuthenticate") {
  // if (
  //   to.name !== "UnAuthorized" &&
  //   to.name !== "2fAuthenticate" &&
  //   to.name !== "MatchHistoryView" //TODO this to be removed
  // ) {
  //   await checkLogInState();
  //   if (to.name !== "Home" && storeUser.state.isAuthenticated === false) {
  //     router.push({ name: "Home" });
  //   }
  // }
  await checkLogInState();
  if (to.name !== "Home" && storeUser.state.isAuthenticated === false) {
    router.push({ name: "Home" });
  }
});

export default router
