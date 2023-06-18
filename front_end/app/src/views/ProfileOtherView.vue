<template>
	<div class="container-fluid">
		<div class="row">
			<div class="col-sm-3 col-md-2 profile-sidebar">
				<ProfileSideBar :userProfile="userProfile" />

				<div class="profile-buttons">
					<ButtonsFriend :friendStatus="userProfile.friendStatus" :intraId="props.intraId" />
					<ButtonsBlock :blockedState="userProfile.blockedState" :intraId="props.intraId" />
				</div>

			</div>

			<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 profile-main">
				<ProfileMainTab :currentIntraId="userProfile.intraId" :currentName="userProfile.username"
					:currentAvatar="userProfile.avatar" />
			</div>

		</div>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import ProfileSideBar from "@/components/ProfileSideBar.vue";
import ButtonsFriend from '@/components/ButtonsFriend.vue';
import ButtonsBlock from '@/components/ButtonsBlock.vue';
import ProfileMainTab from "@/components/ProfileMainTab.vue";
import { HOST } from "@/constants/constants";

const props = defineProps({
	intraId: String,
});

const userProfile = ref({
	intraId: Number(props.intraId),
	avatar: "",
	username: "",
	activityStatus: "ONLINE",
	blockedState: false,
	friendStatus: "NOT_FRIENDS",
	win: "00",
	loss: "00",
	ladderLevel: "00",
});

onMounted(async () => {
	await getUserProfile();
	await getUserMatchInfo();
});

async function getUserProfile() {
	await axios
		.get(`http://${HOST}:3001/user/` + props.intraId, {
			withCredentials: true,
		})
		.then(async (response) => {
			userProfile.value.intraId = response.data.intraId;
			userProfile.value.avatar = `http://${HOST}:3001/user/get_avatar?avatar=` + response.data.avatar;
			userProfile.value.username = response.data.username;
			userProfile.value.activityStatus = response.data.activityStatus;
			userProfile.value.blockedState = response.data.blockedState;
			userProfile.value.friendStatus = response.data.friendStatus;
		})
		.catch(() => {
			console.log("cannot get users profile infomation");
		});
};

async function getUserMatchInfo() {
	await axios
		.get(`http://${HOST}:3001/user/usersexceptself`, {
			withCredentials: true,
		})
		.then(async (response) => {
			for (let i = 0; i < response.data.length; i++) {
				if (response.data[i].intraId === Number(props.intraId)) {
					userProfile.value.win = response.data[i].wins;
					userProfile.value.loss = response.data[i].losses;
					userProfile.value.ladderLevel = response.data[i].elo;
				}
			}
		})
		.catch((error) => {
			console.log("cannot get users match infomation");
			console.log(error);
		});
};

</script>

<style scoped>
.profile-sidebar {
	position: fixed;
	width: 200px;
	top: 70px;
	bottom: 0;
	left: 0;
	z-index: 1000;
	display: block;
	padding: 20px;
	overflow-x: hidden;
	overflow-y: auto;
	/* Scrollable contents if viewport is shorter than content. */
	color: #ffffff;
	background-color: #0a242f;
}

.profile-main {
	padding-left: 200px;
	padding-right: 0px;
	color: #FFFF;
}
</style>