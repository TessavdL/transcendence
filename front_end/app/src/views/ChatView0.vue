<template>
	<div class="create-channel">
		<form @submit.prevent="createChannel">
			<input v-model="channelName" type="text" placeholder="Channel name" />
			<br>
			<ul>
				<label>
					<input type="radio" v-model="channelType" value="public" />
					Public
				</label>

				<label>
					<input type="radio" v-model="channelType" value="protected" />
					Protected
				</label>

				<label v-if="channelType === 'protected'">
					Password
					<input v-model="channelPassword" type="password" />
				</label>

				<label>
					<input type="radio" v-model="channelType" value="private" />
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
			<li v-for="dmchannel in allDMChannels" :key="dmchannel.channelName">
				<a @click="joinDMChannel(dmchannel.channelName)" class="button">{{ dmchannel.channelName }}</a>
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
			<h2>All Messages in {{ activeChannel }}:</h2>
			<div v-for="mes in allMessages" :key="mes.intraId">
				[{{ mes.name }}]: {{ mes.text }}
			</div>
		</div>
		<form @submit.prevent="sendMessage">
			<input v-model="messageText" type="text" placeholder="" />
			<button type="submit">Send Message</button>
		</form>
		<a @click="leaveChannel()" class="button">Leave Room</a>
	</div>
</template>

<script lang='ts'>
import type { Socket } from "socket.io-client";
import { inject, ref } from 'vue';
import axios from "axios";
import type { Channel, Messages, User } from "../types/ChatType";

export default {
	data() {
		return {
			activeChannel: ref(''),
			activeChannelType: ref(''),

			allUsers: ref<User[]>([]),
			allDMChannels: ref<Channel[]>([]),

			allNormalChannels: ref<Channel[]>([]),
			allMyNormalChannels: ref<Channel[]>([]),

			channelName: ref(''),
			channelType: 'public',
			channelPassword: '',
			dmChannelName: ref(''),
			joined: false,
			errorMessage: ref(''),
			messageText: ref(''),
			allMessages: ref<Messages[]>([]),
		}
	},

	setup() {
		const socket = inject("socketioInstance") as Socket;
		const axiosInstance = axios.create({
			baseURL: 'http://localhost:3001',
			withCredentials: true,
		});
		return { axiosInstance, socket };
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
	},

	methods: {
		sendMessage() {
			const messageData = {
				messageText: this.messageText,
				channelName: this.activeChannel,
			};
			this.socket.emit('sendMessageToChannel', messageData);
			this.messageText = '';
		},

		async createChannel() {
			try {
				// Send a POST request to create a new channel
				await this.axiosInstance.post('chat/createChannel', { channelName: this.channelName });
				this.errorMessage = '';

				// Update this.allNormalChannels and this.allMyNormalChannels so it shows the newly created channel
				this.getAllNormalChannels();
				this.getMyNormalChannels();
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
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
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
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
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
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
				const channels: Channel[] = await this.getAllMyChannels();
				const myDMChannels: Channel[] = channels.filter((type) => {
					return (type.channelType === 'DM');
				})
				this.allDMChannels = myDMChannels.map(({ id, channelName, channelType }) => ({
					id,
					channelName,
					channelType: channelType.toString(),
				}));
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
			}
		},

		isMember(channelName: string) {
			return this.allMyNormalChannels.some((myChannel) => myChannel.channelName === channelName);
		},

		isDMMember(otherIntraId: number) {
			return this.allDMChannels.some((myDMChannel) => myDMChannel.channelName.includes(otherIntraId.toString()));
		},

		async joinChannel(channel: string): Promise<void> {
			this.socket.emit('joinChannel', channel);
			this.activeChannel = channel;
			this.activeChannelType = 'NORMAL';
			this.joined = true;
			await this.loadAllMessages();
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

		async loadAllMessages(): Promise<void> {
			try {
				const request: { channelName: string, channelType: string } = {
					channelName: this.activeChannel,
					channelType: this.activeChannelType,
				}
				const response = await this.axiosInstance.get('chat/getAllMessagesInChannel', { params: request });
				const allMessages: Messages[] = response.data;
				this.allMessages = allMessages;
			} catch (error: any) {
				this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
			}
		},

		getOtherUserName(otherIntraId: number): string | undefined {
			const user = this.allUsers.find(x => x.intraId === otherIntraId);
			return user?.name;
		},
	},
}
</script>

<style>
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
