<template>
	<div v-if="channelType === 'PROTECTED' && !hasEnteredPassword" class="input_bar">
		<form @submit.prevent="checkPassword">
			<input type="password" id="checkpassword" class="form-control" v-model="password"
				placeholder="Enter password" />
			<button type="submit">Submit</button>
		</form>
	</div>
	<div v-if="isReady && hasEnteredPassword">
		<div class="col-sm-7 col-sm-offset-3 col-md-9 col-md-offset-2 chatbox-ch">
			<div class="row">
				<div class="ch-header d-inline-flex">
					<div class="ch-name ch-header-item flex-grow-1">
						<h3><i class="bi bi-wechat" style="font-size: 2rem; color: #ffffff;"></i> {{ activeChannel }}
						</h3>
					</div>
					<div class="ch-dropdown ch-header-item">
						<i class="bi bi-sliders2 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"
							style="font-size: 2rem; color: #ffffff;"></i>
						<ul class="dropdown-menu">

							<li v-if="channelType !== 'PRIVATE' && isMemberOwner()"><a class="dropdown-item"
									@click="setChannelSettingsToTrue()">Channel
									Settings</a></li>
							<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#membersList">View All
									Members</a></li>
							<li><a class="dropdown-item" href="#" @click="leaveChannel()">Leave Channel</a>
							</li>
							<li><a class="dropdown-item" href="#" @click="abandonChannel()">Abandon Channel</a>
							</li>

						</ul>
					</div>
				</div>
			</div>

			<div v-if="channelSettings">
				<div class="input-bar">
					<form v-if="channelType === 'PROTECTED'" @submit="changePassword()">
						<input type="text" id="oldpassword" class="form-control" placeholder="Old Password"
							v-model="oldPassword" />
						<input type="password" id="newpassword" placeholder="New Password" v-model="newPassword" />
						<button type="submit">Change Password</button>
					</form>

					<form v-if="channelType === 'PROTECTED'" @submit="removePassword()">
						<input type="password" id="removepassword" class="form-control" placeholder="Password"
							v-model="password" />
						<button type="submit">Remove Password</button>
					</form>

					<form v-else-if="channelType === 'PUBLIC'" @submit="setPassword()">
						<input type="password" id="setpassword" class="form-control" placeholder="Password"
							v-model="password" />
						<button type="submit">Set Password</button>
					</form>

					<button type="button" @click="setChannelSettingsToFalse()">Back to channel</button>
				</div>
			</div>


			<div v-if="!channelSettings" class="ch-body" id="messageBody">
				<div class="msg-container" v-for="msg in allMessages" :key="msg.text">
					<div class="single-msg d-flex flex-column">
						<div class="msg-userinfo d-inline-flex">
							<img :src="avatarPrefix + msg.avatar" class="avatar-msg" alt="avatar">
							<h5 class="msg-username">{{ msg.name }}</h5>
						</div>
						<div v-if="!msg.isLink" class="msg-text">
							<p>{{ msg.text }}</p>
						</div>
						<div v-else-if="msg.isLink" class="msg-text">
							<p>Do you want to play a game? Click <a href="#" @click="navigateToLink(msg.text)">{{
								'here' }}</a> to join</p>
						</div>
					</div>
				</div>
			</div>

			<div v-if="!channelSettings" class="ch-input">
				<form @submit.prevent="sendMessage">
					<div class="input-group mb-3">
						<input type="text" id="message" class="form-control" placeholder="type in messages here"
							v-model="messageText">
						<button class="btn btn-outline-secondary" type="submit" id="button-msg">Send</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Modal of Member List -->
		<div class="modal fade" id="membersList" tabindex="-1" aria-labelledby="membersListLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5" id="membersListLabel">All Members</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div v-for="member in allMembers" :key="member.intraId">
							<div v-if="userIntraId == member.intraId">
								<p v-if="member.role == 'OWNER'">{{ member.name }}(Owner)</p>
								<p v-if="member.role == 'ADMIN'">{{ member.name }}(Admin)</p>
								<p v-if="member.role == 'MEMBER'">{{ member.name }}(Member)</p>
							</div>
							<div class="dropdown" v-else>
								<p v-if="member.role == 'OWNER'" class="dropdown-toggle" type="button" id="user-dropdown"
									data-bs-toggle="dropdown" aria-expanded="false">
									{{ member.name }}(Owner)
								</p>
								<p v-if="member.role == 'ADMIN'" class="dropdown-toggle" type="button" id="user-dropdown"
									data-bs-toggle="dropdown" aria-expanded="false">
									{{ member.name }}(Admin)
								</p>
								<p v-if="member.role == 'MEMBER'" class="dropdown-toggle" type="button" id="user-dropdown"
									data-bs-toggle="dropdown" aria-expanded="false">
									{{ member.name }}
								</p>
								<ul class="dropdown-menu" aria-labelledby="user-dropdown"
									v-if="userRole == 'OWNER' || userRole == 'ADMIN'">
									<li><a class="dropdown-item" href="#">
											<RouterLink class="nav-link" :to="{ path: '/profile/other/' + member.intraId }">
												View Profile</RouterLink>
										</a></li>
									<li v-if="member.role != 'OWNER'"><a class="dropdown-item" href="#"
											@click="banUser(member.intraId)">Ban</a></li>
									<li v-if="member.role != 'OWNER'"><a class="dropdown-item" href="#"
											@click="muteUser(member.intraId)">Mute</a></li>
									<li v-if="member.role !== 'OWNER' && isActive(member.intraId)"><a class="dropdown-item"
											href="#" @click="kickUser(member.intraId)">Kick</a></li>
									<li v-if="member.role == 'MEMBER'"><a class="dropdown-item" href="#"
											@click="promoteMemberToAdmin(member.intraId)">Promote
											member
											to
											admin</a></li>
									<li v-if="member.role == 'ADMIN'"><a class="dropdown-item" href="#"
											@click="demoteAdmintoMember(member.intraId)">Demote
											admin to
											member</a></li>
									<li v-if="isActive(member.intraId)"><a class="dropdown-item" href="#"
											@click="inviteToGame(member.intraId)">Invite
											to Game</a></li>
								</ul>
								<ul class="dropdown-menu" aria-labelledby="user-dropdown" v-else>
									<li v-if="isActive(member.intraId)"><a class="dropdown-item" href="#"
											@click="inviteToGame(member.intraId)">Invite
											to Game</a></li>
									<li><a class="dropdown-item" href="#">
											<RouterLink class="nav-link" :to="{ path: '/profile/other/' + member.intraId }">
												View Profile</RouterLink>
										</a></li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, defineProps, onMounted, onBeforeMount, computed, onUnmounted } from "vue";
import $ from "jquery";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";
import type { Member, Message, Punishment } from "../types/ChatType";
import storeUser from "@/store";
import router from "@/router";
import { Socket, io } from "socket.io-client"
import { HOST } from "@/constants/constants";

const props = defineProps({
	channelName: {
		type: String,
		required: true,
	},
});

const toast = useToast();
const axiosInstance = axios.create({
	baseURL: `http://${HOST}:3001/chat`,
	withCredentials: true,
});
const emit = defineEmits<{
	(event: "isActionSuccess"): boolean;
}>();

const activeChannel = ref('');
const allMessages = ref<Message[]>([]);
const channelSettings = ref<boolean>(false);
const channelType = ref('');
const member = ref<Member>();
const messageText = ref('');
const oldPassword = ref('');
const newPassword = ref('');
const hasEnteredPassword = ref<boolean>(true);
const password = ref('');
const allMembers = ref<Member[]>([]);
const activeMembers = ref<Member[]>([]);
const userIntraId = ref<number>(storeUser.state.user.intraId);
const userRole = ref();
const avatarPrefix = ref(`http://${HOST}:3001/user/get_avatar?avatar=`);
let socket: Socket;

onBeforeMount(async () => {
	socket = io(
		`http://${HOST}:3001/chat`, {
		withCredentials: true,
	}
	);
	activeChannel.value = props.channelName;
	await joinChannel();
});

onMounted(async () => {
	socket.on('joined', async (data) => {
		if (data === null) {
			toast.add({
				severity: "error",
				summary: "Error",
				detail: errorMessage(ErrorType.CHAT_FORBIDDEN),
				life: 3000,
			});
		}
		else {
			await loadAllMembers();
			await getChannelType();
			await loadAllMessages();
			if (channelType.value === 'PROTECTED') {
				hasEnteredPassword.value = false;
			}
			const memberdata: Member = {
				intraId: data.user.intraId,
				name: data.user.name,
				avatar: data.user.avatar,
				role: data.role,
			};
			member.value = memberdata;
		}
	});

	socket.on('leaveChannel', () => {
		leaveChannel();
	});

	socket.on('left', () => {
		socket.disconnect();
		router.push({
			name: 'Chat',
		});
	});

	socket.on('userJoined', (data) => {
		const memberdata: Member = {
			intraId: data.user.intraId,
			name: data.user.name,
			avatar: data.user.avatar,
			role: data.role,
		};
		activeMembers.value.push(memberdata);
		console.log(`${memberdata.name} joined`);
	});

	socket.on('userLeft', (data) => {
		const memberToRemove: Member = {
			intraId: data.user.intraId,
			name: data.user.name,
			avatar: data.user.avatar,
			role: data.role,
		};
		const index = activeMembers.value.findIndex((activeMember) => activeMember.intraId === memberToRemove.intraId);
		if (index !== -1) {
			activeMembers.value.splice(index, 1);
		}
		console.log(`${memberToRemove.name} left`);
	});

	socket.on('otherJoinedMembers', (data) => {
		const members = data.map((item: any) => {
			const { user, role } = item;
			return {
				intraId: user.intraId,
				name: user.name,
				avatar: user.avatar,
				role: role
			};
		});
		activeMembers.value = [...members];
		console.log('active members in chat');
		activeMembers.value.forEach((member: Member) => {
			console.log(member.name);
		})
	})

	socket.on('message', (data) => {
		allMessages.value.push(data);
		$("#messageBody").animate({ scrollTop: 20000000 }, "slow");
	});

	socket.on('createGame', (data) => {
		const gameid = data;
		if (gameid === undefined || gameid === null) {
			toast.add({
				severity: "error",
				summary: "Error",
				detail: errorMessage(ErrorType.GENERAL),
				life: 3000,
			});
			return;
		}
		router.push({
			name: 'Game',
			params: { gameid: gameid },
		});
	});

	socket.on('inviteForGame', (data) => {
		const gameid: string = data.gameId;
		if (gameid === undefined || gameid === null) {
			toast.add({
				severity: "error",
				summary: "Error",
				detail: errorMessage(ErrorType.GENERAL),
				life: 3000,
			});
			return;
		}
		const invite: Message = {
			channelName: '',
			intraId: data.user.intraId,
			name: data.user.name,
			avatar: data.user.avatar,
			text: gameid,
			isLink: true,
		}
		allMessages.value.push(invite);
	});
});

onUnmounted(() => {
	console.log('leaving chat');
	socket.removeAllListeners();
	if (member.value) {
		leaveChannel();
	}
	$('.modal-backdrop').remove();
});

const isReady = computed(() => {
	return !!member.value;
});

function isActive(intraId: number) {
	return activeMembers.value.some((member) => member.intraId === intraId);
}

function isMemberOwner() {
	return member.value?.role === 'OWNER';
}

function setChannelSettingsToTrue() {
	channelSettings.value = true;
}

function setChannelSettingsToFalse() {
	channelSettings.value = false;
}

async function isMuted() {
	try {
		const data = {
			channelName: activeChannel.value,
		};
		const response = await axiosInstance.get('amIMuted', { params: data });
		const mute: Punishment = response.data;
		return mute;
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.GENERAL),
			life: 3000,
		});
	}
}

async function isBanned(channelName: string) {
	try {
		const data = {
			channelName: activeChannel.value,
		};
		const response = await axiosInstance.get('amIBanned', { params: { channelName: channelName } });
		const ban: Punishment = response.data;
		return ban;
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.GENERAL),
			life: 3000,
		});
	}
}

async function getChannelType() {
	try {
		const data = {
			channelName: activeChannel.value,
		}
		const response = await axiosInstance.get('getChannelType', { params: data });
		channelType.value = response.data;
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.GENERAL),
			life: 3000,
		});
	}
}

async function checkPassword() {
	const data = {
		channelName: activeChannel.value,
		password: password.value,
	}
	try {
		const response = await axiosInstance.get('checkPassword', { params: data });
		password.value = '';
		const check: boolean = response.data;
		if (check === true) {
			hasEnteredPassword.value = true;
		}
		else {
			toast.add({
				severity: "error",
				summary: "Error",
				detail: errorMessage(ErrorType.CHECK_PASSWORD_FAILED),
				life: 3000,
			});
		}
	} catch (error: any) {
		password.value = '';
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.GENERAL),
			life: 3000,
		});
	}
}

async function changePassword() {
	const data = {
		channelName: activeChannel.value,
		oldPassword: oldPassword.value,
		newPassword: newPassword.value,
	}
	try {
		await axiosInstance.patch('changePassword', data);
		emit("isActionSuccess", true);
		setChannelSettingsToFalse();
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.CHANGE_PASSWORD_FAILED),
			life: 3000,
		});
		emit("isActionSuccess", false);
	}
	oldPassword.value = '';
	newPassword.value = '';
}

async function setPassword() {
	const data = {
		channelName: activeChannel.value,
		password: password.value,
	};
	try {
		await axiosInstance.patch('setPassword', data);
		emit("isActionSuccess", true);
		setChannelSettingsToFalse();
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.SET_PASSWORD_FAILED),
			life: 3000,
		});
		emit("isActionSuccess", false);
	}
	password.value = '';
}

async function removePassword() {
	const data = {
		channelName: activeChannel.value,
		password: password.value,
	};
	try {
		await axiosInstance.patch('deletePassword', data);
		emit("isActionSuccess", true);
		setChannelSettingsToFalse();
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.REMOVE_PASSWORD_FAILED),
			life: 3000,
		});
		emit("isActionSuccess", false);
	}
	password.value = '';
}

async function joinChannel(): Promise<void> {
	const ban = await isBanned(activeChannel.value);
	if (ban && ban.status === true) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: `You are still banned for ${ban.time} seconds`,
			life: 3000,
		});
		return;
	}
	if (socket.connected) {
		socket.emit('joinChannel', activeChannel.value);
	}
	else {
		socket.on('hasConnected', async () => {
			socket.emit('joinChannel', activeChannel.value);
		});
	}
}

async function loadAllMessages(): Promise<void> {
	const data = {
		channelName: activeChannel.value,
	}
	try {
		const response = await axiosInstance.get('getAllMessagesInChannel', { params: data });
		allMessages.value = response.data;
	}
	catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.LOAD_MSG_FAILED),
			life: 3000,
		});
	}
}

function sendErrorMessage(mute: Punishment) {
	let text: string;
	if (mute.time === 0) {
		text = `You are still muted for one second`;
	}
	else {
		text = `You are still muted for ${mute.time} seconds`;
	}
	const message: Message = {
		channelName: '',
		intraId: 0,
		name: '',
		avatar: './src/assets/prohibited.jpeg',
		text: text,
		isLink: false
	}
	allMessages.value.push(message);
	messageText.value = '';
	$("#messageBody").animate({ scrollTop: 20000000 }, "slow");
}

async function sendMessage() {
	const mute: Punishment = await isMuted();
	if (mute.status === true) {
		sendErrorMessage(mute);
	}
	else {
		if (!(messageText.value.length > 0)) {
			return;
		}
		if (messageText.value.length > 140) {
			toast.add({
				severity: "error",
				summary: "Error",
				detail: "Message cannot be longer than 140 characters",
				life: 3000,
			});
			messageText.value = '';
			return;
		}
	}
	const messageData = {
		messageText: messageText.value,
		channelName: activeChannel.value,
	};
	try {
		socket.emit('sendMessageToChannel', messageData);
		messageText.value = '';
		$("#messageBody").animate({ scrollTop: 20000000 }, "slow");
	}
	catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.SEND_MSG_FAILED),
			life: 3000,
		});
	}
}

async function loadAllMembers(): Promise<void> {
	const data = {
		channelName: activeChannel.value,
	}
	try {
		const response = await axiosInstance.get('getMembersInChannel', { params: data });
		allMembers.value = response.data;
		for (let member of allMembers.value) {
			if (member.intraId == userIntraId.value) {
				userRole.value = member.role
			}
		}
	}
	catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.LOAD_CHANNEL_MEMBERS_FAILED),
			life: 3000,
		});
	}
};

async function kickUser(otherIntraId: number): Promise<void> {
	socket.emit('kickUser', { otherIntraId: otherIntraId, channelName: activeChannel.value });
}

async function banUser(otherIntraId: number): Promise<void> {
	socket.emit('banUser', { otherIntraId: otherIntraId, channelName: activeChannel.value });
}

async function muteUser(otherIntraId: number): Promise<void> {
	socket.emit('muteUser', { otherIntraId: otherIntraId, channelName: activeChannel.value });
}

async function promoteMemberToAdmin(otherIntraId: number): Promise<void> {
	try {
		const data = {
			channelName: activeChannel.value,
			otherIntraId: otherIntraId,
		}
		await axiosInstance.patch('promoteMemberToAdmin', data);
		await loadAllMembers();
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.GENERAL),
			life: 3000,
		});
	}
}

async function demoteAdmintoMember(otherIntraId: number): Promise<void> {
	try {
		const data = {
			channelName: activeChannel.value,
			otherIntraId: otherIntraId,
		}
		await axiosInstance.patch('demoteAdminToMember', data);
		await loadAllMembers();
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.GENERAL),
			life: 3000,
		});
	}
}

function inviteToGame(otherIntraId: number): void {
	const data = {
		channelName: activeChannel.value,
		otherIntraId: otherIntraId,
	}
	socket.emit('gameChallenge', data);
}

async function abandonChannel() {
	const data = {
		channelName: activeChannel.value,
	};
	try {
		await axiosInstance.delete('removeUserFromChannel', { data });
		leaveChannel();
		emit("isActionSuccess", true);
	} catch (error: any) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage(ErrorType.GENERAL),
			life: 3000,
		});
		emit("isActionSuccess", false);
	}
}

function leaveChannel(): void {
	socket.emit('leaveChannel', activeChannel.value);
}

function navigateToLink(gameid: string) {
	router.push({
		name: 'Game',
		params: { gameid: gameid },
	});
}


</script>

<style scoped>
.chatbox-ch {
	margin-left: 30px;
	margin-top: 10px;
	min-height: 760px;
	min-width: 500px;
}

h3 {
	margin-top: 5px;
	margin-bottom: 5px;
	margin-left: 10px;
	text-align: left;
}

.ch-header-item {
	margin-right: 10px;
}

.ch-header {
	border-bottom: #c8b8b8 2px solid;
}

.avatar-msg {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	object-fit: cover;
	margin-right: 10px;
}

.msg-usernaem {
	font-style: italic;
	color: #c8b8b8;
}

.msg-text {
	text-align: left;
	margin-left: 30px;
	font-size: 20px;
}

.single-msg {
	margin-top: 15px;
}

.ch-input {
	position: fixed;
	bottom: 0;
	width: 50%;
	min-width: 500px;
}

.ch-body {
	display: flex;
	flex-direction: column;
	overflow: auto;
	max-height: 75vh;
}

#membersList {
	color: black;
}

.input-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 10px;
}

.input-bar input[type="text"],
.input-bar input[type="password"] {
	flex-grow: 1;
	margin-right: 10px;
	padding: 5px;
	border: 1px solid #ccc;
	border-radius: 4px;
}

.input-bar button {
	padding: 5px 10px;
}
</style>