import { createRouter, createWebHistory } from 'vue-router';
import storeUser from "@/store";

import HomeView from '@/views/HomeView.vue';
import TwoFactorAuthEnableView from '@/views/TwoFactorAuthEnableView.vue';
import TwoFactorAuthVarifyView from '@/views/TwoFactorAuthVarifyView.vue';
import GameView from "@/views/GameView.vue";
import ChatView from "@/views/ChatView.vue";
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

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'Home',
			component: HomeView
		},
		{
			path: '/twofactorenable',
			name: 'twofactorenable',
			component: TwoFactorAuthEnableView
		},
		{
			path: '/twofactorvarify',
			name: 'twofactorvarify',
			component: TwoFactorAuthVarifyView
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
			path: '/profile/other/:id',
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
			path: '/matchmaking',
			name: 'Matchmaking',
			component: MatchmakingView
		},
	]
})

// Check if the user is logged in 
const checkLogInState = async function () {
	console.log("in check login state");
	if (storeUser.state.isAuthenticated === false) {
		await storeUser.dispatch("login");
	}
};

router.beforeEach(async (to) => {
	console.log("in before each");
	if (
		to.name !== "twofactorenable" &&
		to.name !== "twofactorvarify"
		) {
		await checkLogInState();
		if (to.name !== "Home" && storeUser.state.isAuthenticated === false) {
			router.push({ name: "Home" });
		}
	}
});

export default router
