import router from "@/router";
import axios from "axios";
import { createStore } from "vuex";
import { HOST } from "../constants/constants";

const storeUser = createStore({
	state: {
		isAuthenticated: false,
		is2FA: false,
		user: {
			id: "",
			name: "",
			avatar: "",
			twoFactorEnabled: false,
			gameMode: "normal",
		},
		roomsInfo: [],
	},
	getters: {
		isAuthenticated(state) {
			return state.isAuthenticated;
		},
	},
	mutations: {
		updateId(state, id) {
			state.user.id = id;
		},
		updateName(state, name) {
			state.user.name = name;
		},
		updateUserAvatar(state, avatar) {
			state.user.avatar = avatar;
		},
		updateTwoFactor(state, update) {
			state.user.twoFactorEnabled = update;
		},
		setAuthenticated(state) {
			state.isAuthenticated = true;
		},
		unsetAuthenticated(state) {
			state.isAuthenticated = false;
		},
		set2FA(state) {
			state.is2FA = true;
		},
		unset2FA(state) {
			state.is2FA = false;
		},
		updateGameMode(state, mode) {
			state.user.gameMode = mode;
		},
		updateRoomsListInStore(state, updatedRoomsList) {
			state.roomsInfo = updatedRoomsList;
		},
	},
	actions: {
		async login({ commit }) {
			if (storeUser.getters.isAuthenticated === false) {
				await axios
					.get(`http://${HOST}:3001/user`, {
						withCredentials: true,
					})
					.then(async (response) => {
						// commit("setAuthenticated");
						// commit("updateId", response.data.id);
						// commit("updateName", response.data.name);
						// commit("updateUserAvatar", "http://localhost:3001/user/get_avatar?avatar=" + response.data.avatar);
						// commit("updateTwoFactor", response.data.twofaStatus);
						// commit("setAuthenticated");
						commit("updateId", response.data.id);
						commit("updateTwoFactor", response.data.twofaStatus);
						if (response.data.twofaStatus && !this.state.is2FA) {
							router.push({ name: "twofactorvarify" });
						}
						else {
							commit("setAuthenticated");
							commit("updateId", response.data.id);
							commit("updateName", response.data.name);
							commit("updateUserAvatar", `http://${HOST}:3001/user/get_avatar?avatar=` + response.data.avatar);
							commit("updateTwoFactor", response.data.twofaStatus);
						}
					})
					.catch (error => {
						console.log('user not authorized');
					})
			}
		},
		async enable2F({ commit }) {
			commit("updateTwoFactor", true);
		},
		logout({ commit }) {
			commit("unsetAuthenticated");
			commit("unset2FA");
		},
	},
});

export default storeUser;
