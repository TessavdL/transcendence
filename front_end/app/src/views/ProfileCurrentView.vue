<template>
	<div class="container-fluid">
		<div class="row">
			<div class="col-sm-3 col-md-2 profile-sidebar">
				<ProfileSideBar :userProfile="userProfile" />

				<div class="profile-buttons">
					<button type="button" class="btn btn-outline-primary watch-button"
						style="color:#ffffff; background-color: #094b5f; border: 2px solid #ffffff;"
						@click="$router.push('/profileedit')">
						Edit Profile
					</button>
				</div>
			</div>

			<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 profile-main">
				<ProfileMainTab :currentId="userProfile.id" :currentName="userProfile.name"
					:currentAvatar="userProfile.avatar" />
			</div>

		</div>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import storeUser from "@/store";
import ProfileSideBar from "@/components/ProfileSideBar.vue";
import ProfileMainTab from "@/components/ProfileMainTab.vue";
import { HOST } from "@/constants/constants";

const userProfile = ref({
	id: storeUser.state.user.id,
	avatar: "",
	name: "",
	activityStatus: "ONLINE",
	win: 0,
	loss: 0,
	ladderLevel: 0,
});

onMounted(async () => {
	await getCurrentUserProfile();
});

async function getCurrentUserProfile() {
	await axios
		.get(`http://${HOST}:3001/user`, {
			withCredentials: true,
		})
		.then(async (response) => {
			userProfile.value.id = response.data.id;
			userProfile.value.avatar = `http://${HOST}:3001/user/get_avatar?avatar=` + response.data.avatar;
			userProfile.value.name = response.data.name;
			userProfile.value.activityStatus = response.data.activityStatus;
			userProfile.value.win = response.data.wins;
			userProfile.value.loss = response.data.losses;
			userProfile.value.ladderLevel = response.data.elo;
		})
		.catch(() => {
			console.log("cannot get users profile infomation");
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