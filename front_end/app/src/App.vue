<template>
  <div>
    <WebsiteTitle />
    <router-view />    
  </div>

</template>

<script setup lang="ts">
// import { RouterView } from 'vue-router';
import { provide } from "vue";
import SocketioService from "./services/socketio.service";
import WebsiteTitle from "./components/WebsiteTitle.vue";

// create a socket instance for connecting client
const socket = SocketioService.setupSocketConnection();
// dependency provider of socketio instance for all its descendants
provide("socketioInstance", socket);

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #8cb8e4;
}

body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--surface-a);
  font-family: var(--font-family);
  font-weight: 400;
  color: var(--text-color);
}

@keyframes p-progress-spinner-color {
  100%,
  0% {
    stroke: #fffafa;
  }
  40% {
    stroke: #0057e7;
  }
  66% {
    stroke: #6722f3;
  }
  80%,
  90% {
    stroke: #d5e7fb;
  }
}

</style>
