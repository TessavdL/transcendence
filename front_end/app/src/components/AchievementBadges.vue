<template>
	<div class="d-inline-flex justify-content-around align-items-center" v-for="badge in badges" :key="badge.achievement">
		<div class="badge-item">
			<img :src="badge.badgesPicture" class="badge-pic" :alt="badge.badgesTitle">
			<h4 class="badge-title">{{ badge.badgesTitle }}</h4>
			<p class="badge-description">{{ badge.badgesdescription }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, defineProps, onMounted } from 'vue';
import { useToast } from "primevue/usetoast";
import { BadgesType, badgesPicture, badgesTitle, badgesdescription } from '@/types/BadgesType';
import { HOST } from "@/constants/constants";

const props = defineProps({
	currentIntraId: Number,
});

const toast = useToast();

const axiosInstance = axios.create({
	baseURL: `http://${HOST}:3001`,
	withCredentials: true,
});

const achievementsDict = {
	'wonGame': BadgesType.WON_GAME,
	'won3Game': BadgesType.WON_3GAME,
	'won3GameRow': BadgesType.WON_3GAME_ROW,
	'loseGame': BadgesType.LOSE_GAME,
	'lose3GameRow': BadgesType.LOSE_3GAME,
	'playedGame': BadgesType.PLAYED_GAME,
	'changedName': BadgesType.CHANGE_NAME,
	'uploadedAvatar': BadgesType.UPLOAD_AVATAR,
	'added2FA': BadgesType.ADDED_2FA,
	'rank1': BadgesType.RANK1
}

const badges = ref([]);

onMounted(async () => {
	await getAchievement();
});

async function getAchievement() {
	try {
		const response = await axiosInstance.get('/user/achievements/' + props.currentIntraId);
		badges.value = parseAchievements(response.data.achievements);
	} catch (error) {
		toast.add({
			severity: "error",
			summary: "error",
			detail: "Failed to get achievement badges",
			life: 3000,
		});
	}
};

function parseAchievements(list: object) {
	let res = [];
	for (const key in list) {
		if (list[key] === true) {
			const badge = {
				'achievement': achievementsDict[key],
				'badgesTitle': badgesTitle(achievementsDict[key]),
				'badgesPicture': badgesPicture(achievementsDict[key]),
				'badgesdescription': badgesdescription(achievementsDict[key]),
			};
			res.push(badge)
		}
	}
	return res;
}

</script>

<style scoped>
.badge-pic {
	width: 150px;
}

.badge-title {
	font-weight: blod;
	color: #ffffff;
	margin: 10px auto;
}

.badge-description {
	font-style: italic;
	color: #d3d3d3;
}

.badge-item {
	margin: 30px;
}
</style>