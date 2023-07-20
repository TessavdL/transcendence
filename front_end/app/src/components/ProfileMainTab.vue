<template>
	<div class="profile-tab">
		<ul class="nav nav-tabs nav-justified" id="myTab" role="tablist">
			<li class="nav-item" role="presentation">
				<button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#history-tab-pane"
					type="button" role="tab" aria-controls="history-tab-pane" aria-selected="true">Match History</button>
			</li>
			<li class="nav-item" role="presentation">
				<button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#achievement-tab-pane"
					type="button" role="tab" aria-controls="achievement-tab-pane" aria-selected="false">Achievement</button>
			</li>
			<li class="nav-item" role="presentation">
				<button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#ladder-tab-pane"
					type="button" role="tab" aria-controls="ladder-tab-pane" aria-selected="false">Ladder</button>
			</li>
		</ul>

		<div class="tab-content" id="myTabContent">
			<div class="tab-pane fade show active" id="history-tab-pane" role="tabpanel" aria-labelledby="home-tab"
				tabindex="0">
				<div v-for="match in matches" :key="match.id">
					<MatchHistory :matchRecord="match" :currentName="props.currentName"
						:currentAvatar="props.currentAvatar" />
				</div>
			</div>

			<div class="tab-pane fade" id="achievement-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
				<AchievementBadges :currentId="props.currentId" />
			</div>

			<div class="tab-pane fade" id="ladder-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="0">
				<LadderTable />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, defineProps, PropType, onMounted } from 'vue';
import { useToast } from "primevue/usetoast";
import storeUser from "@/store";
import MatchHistory from './MatchHistory.vue';
import AchievementBadges from './AchievementBadges.vue';
import LadderTable from './LadderTable.vue';
import { HOST } from "@/constants/constants";

const props = defineProps({
	currentId: String,
	currentName: String,
	currentAvatar: String as PropType<string | null>
});

const toast = useToast();

const matches = ref([])

const axiosInstance = axios.create({
	baseURL: `http://${HOST}:3001`,
	withCredentials: true,
});

onMounted(async () => {
	if (props.currentId === storeUser.state.user.id) {
		await getMatchHistoryCurrent();
	} else {
		await getMatchHistoryOther();
	}

});

async function getMatchHistoryCurrent() {
	try {
		const response = await axiosInstance.get('/user/get_match_history');
		matches.value = response.data;
	} catch (error) {
		toast.add({
			severity: "error",
			summary: "error",
			detail: "Failed to load match history",
			life: 3000,
		});
	}
};

async function getMatchHistoryOther() {
	try {
		const response = await axiosInstance.get('/user/get_match_history_by_id?id=' + props.currentId);
		matches.value = response.data;
	} catch (error) {
		toast.add({
			severity: "error",
			summary: "error",
			detail: "Failed to load match history",
			life: 3000,
		});
	}
};

</script>

<style scoped>
.nav-item {
	font-weight: bold;
	font-size: 1.5em;
}

button[aria-selected="true"] {
	color: #0a242f;
}

button[aria-selected="false"] {
	color: #ffffff;
}</style>