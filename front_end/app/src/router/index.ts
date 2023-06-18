import { createRouter, createWebHistory } from 'vue-router';
import storeUser from "@/store";

import HomeView from '@/views/HomeView.vue';
import GameView from "@/views/GameView.vue";
import ChatView from "@/views/ChatView.vue";
import ChatView2 from "@/views/ChatView2.vue";
import ProfileCurrentView from "@/views/ProfileCurrentView.vue";
import ProfileOtherView from "@/views/ProfileOtherView.vue";
import ProfileEditView from "@/views/ProfileEditView.vue";

import ChatUserList from "@/components/ChatUserList.vue";
import ChatChannelList from "@/components/ChatChannelList.vue";
import ChatCreateChannel from "@/components/ChatCreateChannel.vue";
import ChatBoxDm from "@/components/ChatBoxDm.vue";
import ChatBoxChannel from "@/components/ChatBoxChannel.vue";

import LogoutView from "@/views/LogoutView.vue";
import UsersView from "@/views/UsersView.vue";
import MatchmakingView from "@/views/MatchmakingView.vue";
import ChatMatchmakingView from "@/views/ChatMatchmakingView.vue";

import TwofaView from "@/views/TwofaView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'Home',
			component: HomeView
		},
		{
			path: '/game/:gameid',
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
			path: '/chat',
			name: 'Chat',
			component: ChatView,
			children: [
				{
					path: '/chat/ChatUserList',
					name: 'ChatUserList',
					component: ChatUserList,
				},
				{
					path: '/chat/ChatChannelList',
					name: 'ChatChannelList',
					component: ChatChannelList,
				},
				{
					path: '/chat/ChatCreateChannel',
					name: 'ChatCreateChannel',
					component: ChatCreateChannel,
				},
				{
					path: '/chat/ChatboxDm/:channelName',
					name: 'ChatBoxDm',
					component: ChatBoxDm,
					props: true,
				},
				{
					path: '/chat/ChatBoxChannel/:channelName',
					name: 'ChatBoxChannel',
					component: ChatBoxChannel,
					props: true,
				},
			],
		},
		{
			path: '/chat2',
			name: 'Chat2',
			component: ChatView2
		},
		{
			path: '/twofa',
			name: 'twofa',
			component: TwofaView
		},
		{
			path: '/matchmaking',
			name: 'Matchmaking',
			component: MatchmakingView
		},
		{
			path: '/chatMatchmaking/:gameid',
			name: 'chatMatchmaking',
			component: ChatMatchmakingView
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
