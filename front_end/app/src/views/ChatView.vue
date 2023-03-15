<template>
  <!-- <div class="create-dmchannel" v-if="!joined">
    <form @submit.prevent="createDMChannel">
      <input v-model="dmChannelName" type="text" placeholder="DMChannel name" />
      <button type="submit">CreateDMChannel</button>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </form>
  </div> -->

  <!-- <br> -->

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
          Password:
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

  <div class="all-channels" v-if="!joined">
    <h2>All Channels</h2>
    <ul style="list-style: none;">
      <li v-for="channel in allChannels" :key="channel.channelName">
        <a @click="joinChannel(channel.channelName)" class="button">{{ channel.channelName }}</a>
      </li>
    </ul>
  </div>

  <div class="all-users" v-if="!joined">
    <h2>All Users</h2>
    <ul style="list-style: none;">
      <li v-for="user in allUsers" :key="user.intraId">
        <a @click="createDMChannel(user.name)" class="button">{{ user.name }}</a>
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
      allChannels: ref<Channel[]>([]),
      allUsers: ref<User[]>([]),
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
    await this.getAllChannels();
    await this.getAllUsers();
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
        const response = await this.axiosInstance.post('chat/createChannel', { channelName: this.channelName });
        this.activeChannel = response.data;
        this.errorMessage = '';

        // Update this.allChannels so it shows the newly created channel
        this.getAllChannels();

      } catch (error: any) {
        this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
      }
    },

    async getAllChannels(): Promise<void> {
      try {
        const response = await this.axiosInstance.get('chat/findAllChannels');
        this.allChannels = response.data;
      } catch (error: any) {
        this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
      }
    },

    async getAllUsers(): Promise<void> {
      try {
        const response = await this.axiosInstance.get('user/usersexceptself');
        console.log(response.data);
        const users = response.data;
        console.log(users);
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

    async joinChannel(channel: string): Promise<void> {
      this.socket.emit('joinChannel', channel);
      this.activeChannel = channel;
      this.joined = true;
      await this.loadAllMessages(channel);
    },

    leaveChannel(): void {
      this.socket.emit('leaveChannel', this.activeChannel);
      this.activeChannel = '';
      this.joined = false;
    },

    async loadAllMessages(channel: string): Promise<void> {
      try {
        const response = await this.axiosInstance.get('chat/findAllMessagesInChannel', { params: { channelName: channel } });
        const allMessages: Messages[] = response.data;
        this.allMessages = allMessages;
      } catch (error: any) {
        this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
      }
    },

    async createDMChannel(name: string) {
      try {
        // Send a POST request to create a new room
        const otherUser = this.allUsers.find(x => x.name === name);
        if (!otherUser) {
          throw new Error('Cannot create DMChannle, Unknown User');
        }
        const otherIntraId: number = otherUser.intraId;
        const response = await this.axiosInstance.post('chat/createDMChannel', { otherIntraId: otherIntraId });
        this.activeChannel = response.data;
        this.errorMessage = '';

        // Join the newly created room with socketio, needs to be implemented
        this.socket.emit('joinChannel', this.activeChannel);
        this.joined = true;
      } catch (error: any) {
        this.errorMessage = error?.response?.data?.reason || "An unknown error occurred";
      }
    }
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
</style>
