<template>
  <div>
    <WebsiteTitle />
    <router-view />    
  </div>

</template>

<script lang="ts">
import WebsiteTitle from "./components/WebsiteTitle.vue";
export default { components: { WebsiteTitle } };
</script>

<script setup lang="ts">
import { provide } from "vue";
import SocketioService from "./services/socketio.service";

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
}

body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #01181d;
  font-family: var(--font-family);
  font-weight: 400;
  color: var(--text-color);
  padding-top: 80px;
  background-image: url('./assets/design_photos/home_bg.jpg');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}

</style>
