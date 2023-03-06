<template>
  <div>
    <button @click="createRoomAndJoin()">Create Room and Join</button>
    <button @click="sendMessage()">Send Message</button>
  </div>
</template>

<script lang='ts'>
import type { Socket } from "socket.io-client";
import { inject } from 'vue';
import axios from "axios";

export default {
  setup() {
    const socket = inject("socketioInstance") as Socket;
    return { socket };
  },

  methods: {
    sendMessage() {
      this.socket.emit('event', 'hello',);
    },

    async createRoomAndJoin() {
      try {
        const config = {
          withCredentials: true,
        };

        // Send a POST request to create a new room
        axios.defaults.baseURL = 'http://localhost:3001';
        const response = await axios.post('chat/createRoom', {}, config);
        
        // Join the newly created room with socketio
        const roomId: number = response.data.id;
        this.socket.emit('joinRoom', roomId);
        this.socket.emit('sendMessageToRoom', roomId);
      } catch (error) {
        console.error(error);
      }
    },
  },
}
</script>