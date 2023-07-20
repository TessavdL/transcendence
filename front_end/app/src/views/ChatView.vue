<template>
	<div>
		<div class="container-fluid">
			<div class="row">

				<div class="col-sm-3 col-md-2 chat-sidebar">
					<ul class="nav flex-column">
						<li class="nav-item ">
							<h2 class="nav-element" @click="openRoute('/chat/ChatChannelList')">
								<i class="bi bi-border-all" style="font-size: 1.5rem; color: #ffffff;"></i>
								View All Channels
							</h2>
						</li>
						<li class="nav-item">
							<h2 class="nav-element">My Channels
								<i class="bi bi-plus-lg" style="font-size: 1.5rem; color: #ffffff;"
									@click="openRoute('/chat/ChatCreateChannel')"></i>
							</h2>
							<div class="channel-list" v-for="channel in myChannels" :key="channel.id">
								<span @click="openChannel(channel.channelName)">
									<i class="bi bi-broadcast-pin" v-if="channel.channelMode === 'PUBLIC'"></i>
									<i class="bi bi-shield-fill" v-if="channel.channelMode === 'PRIVATE'"></i>
									<i class="bi bi-lock-fill" v-if="channel.channelMode === 'PROTECTED'"></i>
									{{ channel.channelName }}
								</span>
							</div>
						</li>
						<li class="nav-item">
							<h2 class="nav-element">Direct Messages
								<i class="bi bi-plus-lg" style="font-size: 1.5rem; color: #ffffff;"
									@click="openRoute('/chat/ChatUserList')"></i>
							</h2>
							<div class="channel-list" v-for="channel in myDMChannels" :key="channel.otherUserId">
								<span @click="openDm(channel.channelName)">{{ channel.otherUserName }}</span>
							</div>
						</li>
					</ul>
				</div>

				<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 chat-main">
					<router-view :key="$route.fullPath" @isActionSuccess="catchEvent($event)" />
				</div>

			</div>
		</div>
	</div>
</template>
    
<script setup lang="ts">
import axios from "axios";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import type { Channel, DMChannel, Punishment } from "../types/ChatType";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";
import { HOST } from "@/constants/constants";

const axiosInstance = axios.create({
	baseURL: `http://${HOST}:3001`,
	withCredentials: true,
});
const router = useRouter();
const toast = useToast();

const myChannels = ref<Channel[]>([]);
const myDMChannels = ref<DMChannel[]>([]);

onMounted(async () => {
	await getMyDMChannels();
	await getMyChannels();
})

function catchEvent(event) {
	if (event) {
		getMyDMChannels();
		getMyChannels();
	}
}

function openRoute(routePath: string) {
	router.push(routePath);
}
function openDm(subpath: string) {
	const data = {
		channelName: subpath,
	};
	router.push({
		name: 'ChatBoxDm',
		params: data,
	});
}
async function openChannel(subpath: string) {
	const data = {
		channelName: subpath,
	};
	if (await canJoinChannel(subpath) === true) {
		router.push({
			name: 'ChatBoxChannel',
			params: data,
		});
	}
}

async function isBanned(channelName: string): Promise<Punishment> {
	const response = await axiosInstance.get('chat/amIBanned', { params: { channelName: channelName } });
	const ban: Punishment = response.data;
	return ban;
}

async function canJoinChannel(channelName: string): Promise<boolean> {
	const ban: Punishment = await isBanned(channelName);
	if (ban.status === true) {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: `You are still banned for ${ban.time} seconds`,
			life: 3000,
		});
		return false;
	}
	else {
		return true;
	}
};

async function getMyChannels(): Promise<void> {
	try {
		const response = await axiosInstance.get('chat/getMyChannels')
		const channels = response.data;
		const normalChannels: Channel[] = channels.filter((type: any) => {
			return (type.channelType === 'NORMAL');
		});
		myChannels.value = normalChannels.map(channel => {
			return {
				id: channel.id,
				channelName: channel.channelName,
				channelMode: channel.channelMode,
				channelType: channel.channelType,
			};
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

</script>
    
<style scoped>
h2 {
	color: #ffffff;
	text-align: start;
}

.nav-item {
	margin-top: 10px;
	margin-bottom: 10px;
}

.nav-element {
	font-size: 18px;
	color: #ffffff;
	font-weight: bold;
}

.channel-list {
	margin-top: 10px;
	margin-bottom: 10px;
	margin-left: 10px;
	font-size: 16px;
	color: #ffffff;
	font-weight: bold;
	text-align: start;

}

.chat-sidebar {
	position: fixed;
	width: 240px;
	top: 70px;
	bottom: 0;
	left: 0;
	z-index: 1000;
	display: block;
	padding: 10px;
	overflow-x: hidden;
	overflow-y: auto;
	background-color: #0a242f;
}

.chat-main {
	padding-left: 240px;
	color: #ffffff;
}
</style>