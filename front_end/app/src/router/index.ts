import { createRouter, createWebHistory } from 'vue-router';
import storeUser from "@/store";

import HomeView from '@/views/HomeView.vue';
import GameView from "@/views/GameView.vue";

import ProfileCurrentView from "@/views/ProfileCurrentView.vue";
import ProfileOtherView from "@/views/ProfileOtherView.vue";
import ProfileEditView from "@/views/ProfileEditView.vue";

import ChatView0 from "@/views/ChatView0.vue";
import ChatView from "@/views/ChatViewTest.vue";

import LogoutView from "@/views/LogoutView.vue";
import UsersView from "@/views/UsersView.vue";

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
      path: '/profile/current',
      name: 'ProfileCurrent',
      component: ProfileCurrentView,
    },
    {
      path: '/profile/other/:intraId',
      name: 'ProfileOther',
      component: ProfileOtherView,
      props: true,
    },
    {
      path: '/profileedit',
      name: 'ProfileEdit',
      component: ProfileEditView,
    },
    {
      path: '/users',
      name: 'Users',
      component: UsersView
    },
    {
      path: '/logout',
      name: 'Logout',
      component: LogoutView
    },
    {
      path: '/chat0',
      name: 'Chat0',
      component: ChatView0
    },
    {
      path: '/chat',
      name: 'Chat',
      component: ChatView
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
