<template>
	<div class="create-channel">
		<form @submit.prevent="createChannel">
			<input v-model="channelName" type="text" placeholder="Channel name" />
			<br>
			<ul>
				<label>
					<input type="radio" v-model="channelMode" value="PUBLIC" />
					Public
				</label>

				<label>
					<input type="radio" v-model="channelMode" value="PROTECTED" />
					Protected
				</label>

				<label v-if="channelMode === 'PROTECTED'">
					Password
					<input v-model="channelPassword" type="password" />
				</label>

				<label>
					<input type="radio" v-model="channelMode" value="PRIVATE" />
					Private
				</label>
			</ul>
			<button type="submit">Create Channel</button>
			<div v-if="errorMessage" class="error">{{ errorMessage }}</div>
		</form>
	</div>

	<br>

	<div class="all-users" v-if="!joined">
		<h2>All Users</h2>
		<ul style="list-style: none;">
			<li v-for="user in allUsers" :key="user.intraId">
				<button class="button" type="button" disabled>{{ user.name }} {{ user.intraId }}</button>
				<button v-if="!isDMMember(user.intraId)" @click=createDMChannel(user.intraId)>Start a
					conversation</button>
			</li>
		</ul>
	</div>

	<div class="all-channels" v-if="!joined">
		<h2>All Channels</h2>
		<ul style="list-style: none;">
			<li v-for="channel in allNormalChannels" :key="channel.channelName">
				<button class="button" type="button" disabled>{{ channel.channelName }}</button>
				<button v-if="!isMember(channel.channelName)" @click="addUserToChannel(channel.channelName)">Add
					Channel</button>
			</li>
		</ul>
	</div>

	<div class="all-dmchannels" v-if="!joined">
		<h2>All My DMChannels</h2>
		<ul style="list-style: none;">
			<li v-for="dmchannel in dmInfo" :key="dmchannel.channelName">
				<a @click="joinDMChannel(dmchannel.channelName)" class="button">{{ dmchannel.otherUserName }}</a>
			</li>
		</ul>
	</div>

	<div class="all-mychannels" v-if="!joined">
		<h2>All My Channels</h2>
		<ul style="list-style: none;">
			<li v-for="mychannel in allMyNormalChannels" :key="mychannel.channelName">
				<a @click="joinChannel(mychannel.channelName)" class="button">{{ mychannel.channelName }}</a>
			</li>
		</ul>
	</div>

	<div class="chat" v-if="joined">
		<div class="message-container">
			<h2>All Messages from {{ getActiveChannelName(activeChannel) }}:</h2>
			<div v-for="mes in allMessages" :key="mes.intraId">
				[{{ mes.name }}]:
				<div class="mes-text">
					<p v-if="!mes.isLink">{{ mes.text }}</p>
					<p v-else>Do you want to play a game? Click <a href="#" @click="navigateToLink(mes.text)">{{ 'here'
					}}</a> to join</p>
				</div>
			</div>
		</div>
		<form @submit.prevent="sendMessage">
			<input v-model="messageText" type="text" placeholder="" />
			<button type="submit">Send Message</button>
		</form>
		<div class="filterchanneltype" v-if="activeChannelType === 'NORMAL'">
			<li v-for="member in allMembers" :key="member.intraId">
				<a @click="kickUser(member.intraId, activeChannel)" class="button">Kick {{ member.name }}</a>
				<a @click="banUser(member.intraId, activeChannel)" class="button">Ban{{ member.name }}</a>
				<a @click="muteUser(member.intraId, activeChannel)" class="button">Mute{{ member.name }}</a>
				<a @click="gameChallenge(member.intraId)" class="button">Challenge {{ member.name }}</a>
			</li>
		</div>
		<a @click="leaveChannel()" class="button">Leave Room</a>
	</div>
</template>

<script lang='ts'>
import type { Socket } from "socket.io-client";
import { inject, ref } from 'vue';
import axios from "axios";
import type { Channel, Message, User, DMInfo, Member, Punishment } from "../types/ChatType";
import { useRouter } from "vue-router";
import _default from "vuex";
import { HOST } from "@/constants/constants";

export default {
	data() {
		return {
			activeChannel: ref(''),
			activeChannelType: ref(''),

			allUsers: ref<User[]>([]),
			dmInfo: ref<DMInfo[]>([]),

			allNormalChannels: ref<Channel[]>([]),
			allMyNormalChannels: ref<Channel[]>([]),

			channelName: ref(''),
			channelMode: 'PUBLIC',
			channelPassword: '',

			joined: false,
			errorMessage: ref(''),
			messageText: ref(''),
			allMembers: ref<Member[]>([]),
			allMessages: ref<Message[]>([]),
		}
	},

	setup() {
		const socket = inject("socketioInstance") as Socket;
		const axiosInstance = axios.create({
			baseURL: `http://${HOST}:3001`,
			withCredentials: true,
		});
		const router = useRouter();
		return { axiosInstance, socket, router };

	},

	async mounted() {
		await this.getAllUsers();
		await this.getDMChannels();
		await this.getAllNormalChannels();
		await this.getMyNormalChannels();
	},

	created() {
		this.socket.on('message', (data) => {
			this.allMessages.push(data);
		});
		this.socket.on('leaveChannel', (data) => {
			this.leaveChannel();
		});
		this.socket.on('createGame', (data) => {
			console.log(data);
			const gameid = data;
			if (gameid === undefined || gameid === null) {
				this.router.push({
					name: "Home",
				})
			}
			console.log('Redirecting to game', gameid);
			this.router.push(`game/${gameid}`);
		})
		this.socket.on('inviteForGame', (data) => {
			console.log("We are in inviteForGame");
			const gameid = data.gameId;
			console.log(gameid);
			if (gameid === undefined || gameid === null) {
				this.router.push({
					name: "Home",
				})
			}
			const invite: Message = {
				channelName: '',
				intraId: data.user.intraId,
				name: data.user.name,
				avatar: data.user.avatar,
				text: `game/${gameid}`,
				isLink: true,
			}
			this.allMessages.push(invite);
		})
	},

	methods: {
		async sendMessage() {
			const mute: Punishment = await this.isMuted(this.activeChannel);
			if (mute.status === true) {
				if (mute.time === 0) {
					console.log(`You are still muted for one second`);
				}
				else {
					console.log(`You are still muted for ${mute.time} seconds`);
				}
			}
			else {
				const messageData = {
					messageText: this.messageText,
					channelName: this.activeChannel,
				};
				this.socket.emit('sendMessageToChannel', messageData);
			}
			this.messageText = '';
		},

		async createChannel() {
			try {
				// Send a POST request to create a new channel
				const password: string = this.channelPassword;
				this.channelPassword = '';
				if (password === '') {
					await this.axiosInstance.post('chat/createChannel', { channelMode: this.channelMode, channelName: this.channelName });
				}
				else {
					await this.axiosInstance.post('chat/createChannel', { channelMode: this.channelMode, channelName: this.channelName, password: password });
				}
				this.errorMessage = '';

				// Update this.allNormalChannels and this.allMyNormalChannels so it shows the newly created channel
				this.getAllNormalChannels();
				this.getMyNormalChannels();
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "Failed to create channel";
			}
		},

		async addUserToChannel(channelName: string) {
			try {
				// Send a POST request to add the user to an existing channel
				await this.axiosInstance.post('chat/addUserToChannel', { channelName: channelName });

				// Update this.allNormalChannels and this.allMyNormalChannels so it shows the changes in the channels
				this.getAllNormalChannels();
				this.getMyNormalChannels();
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "Failed to add user to channel";
			}
		},

		async createDMChannel(otherIntraId: number) {
			try {
				// Send a POST request to create a new direct message channel
				await this.axiosInstance.post('chat/createDMChannel', { otherIntraId: otherIntraId });
				this.errorMessage = '';

				// Update this.allUsers and this.allMyDMChannels so its hows the newly created direct message channel
				this.getAllUsers();
				this.getDMChannels();
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "Failed to create direct message channel";
			}
		},

		async getAllUsers(): Promise<void> {
			try {
				const response = await this.axiosInstance.get('user/usersexceptself');
				const users = response.data;
				this.allUsers = users.map(user => {
					return {
						intraId: user.intraId,
						name: user.name,
					};
				});
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
			}
		},

		async getAllChannels(): Promise<Channel[]> {
			try {
				const response = await this.axiosInstance.get('chat/getAllChannels');
				const channels: Channel[] = response.data;
				return (channels);
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
			}
		},

		async getAllMyChannels(): Promise<Channel[]> {
			try {
				const response = await this.axiosInstance.get('chat/getMyChannels');
				const channels: Channel[] = response.data;
				return (channels);
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
			}
		},

		async getAllNormalChannels(): Promise<void> {
			try {
				const channels: Channel[] = await this.getAllChannels();
				const normalChannels: Channel[] = channels.filter((type) => {
					return (type.channelType === 'NORMAL');
				});
				this.allNormalChannels = normalChannels.map(({ id, channelName, channelType }) => ({
					id,
					channelName,
					channelType: channelType.toString(),
				}));
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
			}
		},

		async getMyNormalChannels(): Promise<void> {
			try {
				const channels: Channel[] = await this.getAllMyChannels();
				const myNormalChannels: Channel[] = channels.filter((type) => {
					return (type.channelType === 'NORMAL');
				})
				this.allMyNormalChannels = myNormalChannels.map(({ id, channelName, channelType }) => ({
					id,
					channelName,
					channelType: channelType.toString(),
				}));
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
			}
		},

		async getDMChannels(): Promise<void> {
			try {
				const response = await this.axiosInstance.get('chat/getMyDMChannelsWithUser');
				const channels = response.data;
				const dmInfo: DMInfo[] = channels.map((item) => {
					return {
						channelName: item.channel.channelName,
						otherUserAvatar: item.otherUser.avatar,
						otherUserIntraId: item.otherUser.intraId,
						otherUserName: item.otherUser.name,
					};
				});
				this.dmInfo = dmInfo;
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
			}
		},

		isMember(channelName: string) {
			return this.allMyNormalChannels.some((myChannel) => myChannel.channelName === channelName);
		},

		isDMMember(otherIntraId: number) {
			return this.dmInfo.some((item) => item.otherUserIntraId === otherIntraId);
		},

		async isBanned(channelName: string): Promise<Punishment> {
			const response = await this.axiosInstance.get('chat/amIBanned', { params: { channelName: channelName } });
			const ban: Punishment = response.data;
			return ban;
		},

		async isMuted(channelName: string): Promise<Punishment> {
			const response = await this.axiosInstance.get('chat/amIMuted', { params: { channelName: channelName } });
			const mute: Punishment = response.data;
			return mute;
		},

		async joinChannel(channel: string): Promise<void> {
			const ban: Punishment = await this.isBanned(channel);
			if (ban.status === true) {
				if (ban.time === 0) {
					console.log(`You are still banned for one second`);
				}
				else {
					console.log(`You are still banned for ${ban.time} seconds`);
				}
				return;
			}
			this.socket.emit('joinChannel', channel);
			this.activeChannel = channel;
			this.activeChannelType = 'NORMAL';
			this.joined = true;
			await this.loadAllMessages();
			const response = await this.axiosInstance.get('chat/getMembersInChannel', { params: { channelName: channel } });
			this.allMembers = response.data;
		},

		async joinDMChannel(channel: string): Promise<void> {
			this.socket.emit('joinChannel', channel);
			this.activeChannel = channel;
			this.activeChannelType = 'DM';
			this.joined = true;
			await this.loadAllMessages();
		},

		leaveChannel(): void {
			this.socket.emit('leaveChannel', this.activeChannel);
			this.activeChannel = '';
			this.activeChannelType = '';
			this.joined = false;
		},

		async kickUser(otherIntraId: number, channelName: string): Promise<void> {
			this.socket.emit('kickUser', { otherIntraId: otherIntraId, channelName: channelName });
		},

		async banUser(otherIntraId: number, channelName: string): Promise<void> {
			this.socket.emit('banUser', { otherIntraId: otherIntraId, channelName: channelName });
		},

		async muteUser(otherIntraId: number, channelName: string): Promise<void> {
			this.socket.emit('muteUser', { otherIntraId: otherIntraId, channelName: channelName });
		},

		gameChallenge(otherIntraId: number): void {
			this.socket.emit('gameChallenge', { otherIntraId: otherIntraId });
		},

		async loadAllMessages(): Promise<void> {
			try {
				const request: { channelName: string, channelType: string } = {
					channelName: this.activeChannel,
					channelType: this.activeChannelType,
				}
				const response = await this.axiosInstance.get('chat/getAllMessagesInChannel', { params: request });
				const allMessages: Message[] = response.data;
				this.allMessages = allMessages;
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
			}
		},

		getOtherUserName(otherIntraId: number): string | undefined {
			const user = this.allUsers.find(x => x.intraId === otherIntraId);
			return user?.name;
		},

		getActiveChannelName(channelName: string) {
			const channel = this.dmInfo.find((x) => x.channelName === channelName);
			if (channel) {
				return (channel.otherUserName);
			}
			else {
				return (channelName);
			}
		},

		navigateToLink(link: string) {
			// Use your router library to navigate to the link
			this.router.push(link);
		},
	},
}
</script>

<style scoped>
ul,
h2,
.create-channel label,
.message-container {
	color: white;
	margin: 5px;
}

.error {
	color: red;
}

.button {
	display: inline-block;
	width: 120px;
	padding: 8px 12px;
	background-color: rgb(6, 24, 6);
	color: white;
	text-align: center;
	text-decoration: none;
	font-size: 16px;
	margin: 4px 2px;
	cursor: pointer;
}

.button[disabled] {
	pointer-events: none;
}
</style>
