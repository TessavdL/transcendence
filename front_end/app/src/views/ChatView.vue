<template>
  <div>
    <form @submit.prevent="createChannel">
      <input v-model="channelName" type="text" placeholder="Channel name" />
      <button type="submit">Create Channel</button>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </form>
    <div v-if="joined">
      <form @submit.prevent="sendMessage">
        <input v-model="messageText" type="text" placeholder="" />
        <button type="submit">Send Message</button>
      </form>
    </div>
  </div>
</template>

<script lang='ts'>
import type { Socket } from "socket.io-client";
import { inject, ref } from 'vue';
import axios from "axios";

export default {
  setup() {
    const socket = inject("socketioInstance") as Socket;
    return { socket };
  },

  data() {
    return {
      channelName: ref(''),
      errorMessage: ref(''),
      messageText: ref(''),
      activeChannel: ref(''),
      joined: false,
    }
  },

  methods: {
    sendMessage() {
      const messageData = {
        messageText: this.messageText,
        channelName: this.activeChannel,
      }
      this.socket.emit('sendMessageToChannel', messageData);
      this.messageText = '';
    },

    async createChannel() {
      try {
        const config = {
          withCredentials: true,
        };

        // Send a POST request to create a new room
        axios.defaults.baseURL = 'http://localhost:3001';
        const response = await axios.post('chat/createChannel', { channelName: this.channelName }, config);
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