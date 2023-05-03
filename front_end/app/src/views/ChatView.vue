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
							<div class="chanel-list" v-for="channel in myChannels" :key="channel.id">
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
							<div class="chanel-list" v-for="channel in myDms" :key="channel.otheruserIntraId">
								<span @click="openDm(channel.channelName)">{{ channel.otheruserName }}</span>
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
import type { Channel, DmChannel } from "../types/ChatType";
import { assertVariableDeclarator } from "@babel/types";

const myChannels = ref<Channel[]>([]);
const myDms = ref<DmChannel[]>([]);

const router = useRouter();
function openRoute(routePath: string) {
	router.push(routePath);
}
function openDm(subpath: string) {
	router.push({
		name: 'ChatBoxDm',
		params: { channelName: subpath },
	});
}
function openChannel(subpath: string) {
	router.push({
		name: 'ChatBoxChannel',
		params: { channelName: subpath },
	});
}

onMounted(async () => {
	await getMyChannels();
	await getMyDms();
});

function catchEvent(event) {
	if (event) {
		getMyDms();
		getMyChannels();
	}
}

async function getMyChannels(): Promise<void> {
	await axios
		.get("http://localhost:3001/chat/getAllChannels", {
			withCredentials: true,
		})
		.then(async (response) => {
			const channels = response.data;
			const normalChannels: Channel[] = channels.filter((type) => {
				return (type.channelType === 'NORMAL');
			});
			myChannels.value = normalChannels.map(channel => {
				return {
					id: channel.id,
					channelName: channel.channelName,
					channelMode: channel.channelMode,
				};
			});
		})
		.catch((error: any) => {
			console.log(error?.response?.data?.reason);
		});
};

async function getMyDms(): Promise<void> {
	await axios
		.get("http://localhost:3001/chat/getMyDMChannelsWithUser", {
			withCredentials: true,
		})
		.then(async (response) => {
			const channels = response.data;
			myDms.value = channels.map(channel => {
				return {
					channelName: channel.channel.channelName,
					otheruserIntraId: channel.otherUser.intraId,
					otheruserName: channel.otherUser.name,
					otheruserAvatar: channel.otherUser.avatar,
				};
			});
		})
		.catch((error: any) => {
			console.log(error?.response?.data?.reason);
		});
};
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

.chanel-list {
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