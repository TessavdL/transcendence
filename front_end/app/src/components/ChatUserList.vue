<template>
	<div class="user-list-containner">
		<label for="searchuser" class="form-label">Search User</label>
		<input class="search-bar form-control" id="searchuser" type="text" v-model="input" />
		<div class="users-list" v-for="user in filteredList()" :key="user.id">
			<div class="user-list-item d-inline-flex align-items-center" @click="createDMChannel(user.id)">
				<img :src="avatarPrefix + user.avatar" class="avatar-pic-mini" alt="avatar">
				<span class="user-name align-text-bottom" style="cursor: pointer;">
					{{ user.name }}
				</span>
			</div>
		</div>
		<div class="no-result" v-if="input && !filteredList().length">
			<p>No results found!</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted, defineEmits } from "vue";
import type { User, Channel, DMChannel } from "../types/ChatType";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";
import { HOST } from "../constants/constants";
import storeUser from "@/store";

const axiosInstance = axios.create({
	baseURL: `http://${HOST}:3001`,
	withCredentials: true,
});
const toast = useToast();

const allUsers = ref<User[]>([]);
const myDMChannels = ref<DMChannel[]>([]);

let input = ref("");
const avatarPrefix = ref(`http://${HOST}:3001/user/get_avatar?avatar=`);

onMounted(async () => {
	await getAllUsers();
	await getMyDMChannels();
});

async function getMyDMChannels(): Promise<void> {
	try {
		const response = await axiosInstance.get('chat/getMyDMChannelsWithUser');
		const channels = response.data;
		const newDMChannels: DMChannel[] = [];
		channels.forEach((channel: any) => {
			newDMChannels.push({
				channelName: channel.channel.channelName,
				otherUserId: channel.otherUser.id,
				otherUserName: channel.otherUser.name,
				otherUserAvatar: channel.otherUser.avatar,
			});
		});
		myDMChannels.value = [...newDMChannels];
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.GENERAL),
			life: 3000,
		});
	}
}

async function getAllUsers(): Promise<void> {
	await axios
		.get(`http://${HOST}:3001/user/usersexceptself`, {
			withCredentials: true,
		})
		.then(async (response) => {
			const users = response.data;
			allUsers.value = users.map((user: User) => {
				return {
					id: user.id,
					name: user.name,
					avatar: user.avatar,
				};
			});
		})
		.catch((error: any) => {
			toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.GENERAL),
			life: 3000,
		});
	});
};

function filteredList() {
	return allUsers.value.filter((user) =>
		user.name.toLowerCase().includes(input.value.toLocaleLowerCase())
	);
}

const emit = defineEmits<{
	(event: "isActionSuccess"): boolean;
}>();

function isDMExist(id: string): boolean {
	const otherUserIdsInDms: string[] = myDMChannels.value.map((dmChannel: DMChannel) => dmChannel.otherUserId);
	return otherUserIdsInDms.includes(id);
}

async function createDMChannel(id: string) {
	if (isDMExist(id) === false) {
		await axios
			.post(`http://${HOST}:3001/chat/createDMChannel`, { otherUserId: id }, {
				withCredentials: true,
			})
			.then(async (response) => {
				toast.add({
					severity: "success",
					summary: "Success",
					detail: "Created",
					life: 3000,
				});
				emit("isActionSuccess", true);
			})
			.catch(() => {
				toast.add({
					severity: "error",
					summary: "Error",
					detail: errorMessage(ErrorType.CREATE_CHANNEL_FAILED),
					life: 3000,
				});
				emit("isActionSuccess", false);
			});
	}
	else {
		toast.add({
			severity: "info",
			summary: "info",
			detail: "This user is already in your DM List",
			life: 3000,
		});
	}
}

</script>

<style scoped>
.search-bar {
	width: 100%;
	margin-left: 30px;
}

.user-list-item {
	width: 100%;
	margin: 5px auto;
}

.avatar-pic-mini {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	object-fit: cover;
	margin-left: 30px;
	margin-right: 20px;
	margin-top: 10px;
}

.user-name {
	color: #FFFF;
	font-size: 25px;
}

.form-label {
	font-weight: bold;
	font-size: 30px;
}
</style>