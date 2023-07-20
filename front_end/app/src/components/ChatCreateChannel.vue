<template>
	<div class="create-channel-container">
		<form @submit.prevent="createChannel">
			<div class="mb-3 channel-name">
				<label for="channelName" class="form-label">Channel Name</label>
				<input type="text" class="form-control" id="channelName" v-model="channelName">
			</div>

			<div class="form-check form-check-inline channel-type">
				<input class="form-check-input" type="radio" name="inlineRadioOptions" id="type-public" value="PUBLIC"
					v-model="channelType">
				<label class="form-check-label" for="type-public">public</label>
			</div>
			<div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="inlineRadioOptions" id="type-protected" value="PROTECTED"
					v-model="channelType">
				<label class="form-check-label" for="type-protected">protected</label>
			</div>
			<div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="inlineRadioOptions" id="type-private" value="PRIVATE"
					v-model="channelType">
				<label class="form-check-label" for="type-private">private</label>
			</div>

			<div class="mb-3 channel-password" v-if="channelType === 'PROTECTED'">
				<label for="channelPassword" class="form-label">Channel Password</label>
				<input type="password" class="form-control" id="channelPassword" v-model="channelPassword" minlength="4"
					required placeholder="minimum 4 characters">
			</div>
			<div v-if="channelType === 'PRIVATE'">
				<div class="user-list-container">
					<label for="searchuser" class="form-label">Search User</label>
					<input class="search-bar form-control" id="searchuser" type="text" v-model="input" />
					<div class="users-list" v-for="user in filteredList()" :key="user.id">
						<div class="user-list-item d-inline-flex align-items-center">
							<button type="button" class="btn btn-outline-light" @click="toggleUserSelection(user)">
								{{ user.selected ? 'Cancel' : 'Select' }}
							</button>
							<img :src="avatarPrefix + user.avatar" class="avatar-pic-mini" alt="avatar">
							<span class="user-name align-text-bottom">{{ user.name }}</span>
						</div>
						<div class="no-result" v-if="input && !filteredList().length">
							<p>No results found!</p>
						</div>
					</div>
				</div>
			</div>

			<div v-if="channelType !== ''" class="submit-channel">
				<button type="submit" class="btn btn-outline-light"
					style="color:#ffffff; background-color: #09252f; border: 2px solid #ffffff;">Create Channel</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";
import type { UserFromList } from "@/types/ChatType";
import { HOST } from "@/constants/constants";

const toast = useToast();
const avatarPrefix = ref(`http://${HOST}:3001/user/get_avatar?avatar=`);
const channelName = ref('');
const channelType = ref('');
const channelPassword = ref('');
const allUsers = ref<UserFromList[]>([]);
const axiosInstance = axios.create({
	baseURL: `http://${HOST}:3001`,
	withCredentials: true,
});
const input = ref('');

const emit = defineEmits<{
	(event: "isActionSuccess"): boolean;
}>();

onMounted(async () => {
	await getAllUsers();
})

function toggleUserSelection(user: UserFromList) {
	user.selected = !user.selected;
}

async function createChannel() {
	if (!channelName.value.length || channelName.value.length > 20) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: "Channel name cannot be empty or longer than 20 characters",
			life: 3000,
		});
		return setBackToDefault();
	}
	createRequestBody();
	await sendCreateChannelRequest()
	if (channelType.value === 'PRIVATE') {
		await addSelectedUsers();
	}
	setBackToDefault();
}

function setBackToDefault() {
	channelType.value = '';
	channelName.value = '';
	input.value = '';
	allUsers.value.forEach((user: UserFromList) => {
		user.selected = false;
	})
}

let requestBody = {};
function createRequestBody() {
	if (channelPassword.value === '') {
		requestBody = {
			channelMode: channelType.value,
			channelName: channelName.value,
		}
	}
	else {
		requestBody = {
			channelMode: channelType.value,
			channelName: channelName.value,
			password: channelPassword.value,
		}
	}
}

async function sendCreateChannelRequest() {
	await axios
		.post(`http://${HOST}:3001/chat/createChannel`, requestBody, {
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

async function getAllUsers(): Promise<void> {
	await axios
		.get(`http://${HOST}:3001/user/usersexceptself`, {
			withCredentials: true,
		})
		.then(async (response) => {
			const users = response.data;
			allUsers.value = users.map((user: any) => {
				return {
					id: user.id,
					name: user.name,
					avatar: user.avatar,
					selected: false,
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

async function addSelectedUsers() {
	const selectedUsers = allUsers.value.filter(user => user.selected);
	const userIds = selectedUsers.map(user => user.id);

	try {
		userIds.forEach(async (id: string) => {
			const data = {
				channelName: channelName.value,
				otherId: id,
			};
			await axiosInstance.post('chat/addAnotherUserToChannel', data);
		});
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.GENERAL),
			life: 3000,
		});
	}
}

</script>

<style scoped>
.create-channel-container {
	margin-left: 20px;
}

.channel-password {
	margin-top: 30px;
	margin-bottom: 30px;
}

.form-label {
	font-weight: bold;
	font-size: 30px;
}

.form-check-label {
	font-size: 20px;
}

.btn {
	margin-top: 30px;
	margin-bottom: 30px;
}

.search-bar {
	width: 100%;
	/* margin-left: 30px; */
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
</style>
