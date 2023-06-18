<template>
	<div class="ladder-table">
		<table class="table">
			<thead class="table-header">
				<tr>
					<th scope="col">Rank</th>
					<th scope="col">User</th>
					<th scope="col">Win</th>
					<th scope="col">Loss</th>
				</tr>
			</thead>
			<tbody class="table-body" v-for="player in ladder" :key="player.rank">
				<tr>
					<th scope="row">{{ player.rank }}</th>
					<td>
						<img :src="avatarPrefix + player.userAvatar" class="avatar-pic-mini" alt="avatar">
						{{ player.userName }}
					</td>
					<td>{{ player.win }}</td>
					<td>{{ player.loss }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
import { HOST } from '@/constants/constants';
import axios from "axios";
import { ref, defineProps, onMounted } from 'vue';
import { useToast } from "primevue/usetoast";

const toast = useToast();

const avatarPrefix = ref(`http://${HOST}:3001/user/get_avatar?avatar=`);

const ladder = ref();

const axiosInstance = axios.create({
	baseURL: `http://${HOST}:3001`,
	withCredentials: true,
});

onMounted(async () => {
	await getLadderTab();
});

async function getLadderTab() {
	try {
		const response = await axiosInstance.get('/user/get_leaderboard');
		parseLadder(response)
		ladder.value = parseLadder(response.data);
	} catch (error) {
		toast.add({
			severity: "error",
			summary: "error",
			detail: "Failed to load the ladder table",
			life: 3000,
		});
	}
};

function parseLadder(response: Array) {
	let ladderList = [];
	for (let i = 0; i < response.length; i++) {
		const player = {
			"rank": i + 1,
			"userName": response[i].name,
			"userAvatar": response[i].avatar,
			"win": response[i].wins,
			"loss": response[i].losses
		}
		ladderList.push(player)
	}
	return ladderList;
}

</script>

<style scoped>
.table-header {
	color: #FFFF;
	font-weight: bold;
	font-size: 25px;
}

.table-body {
	color: #FFFF;
	font-size: 25px;
}

.avatar-pic-mini {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	object-fit: cover;
}
</style>