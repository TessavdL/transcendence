<template>
  <div class="home">
    <div v-if="storeUser.state.isAuthenticated">
      <div class="about">
        <h3>About PONG</h3>
        <p>Pong is one of the first computer games that ever created.</p>
        <p>The game was originally developed by Allan Alcorn and released in 1972 by Atari corporations. </p>
        <p>This simple "tennis like" game features two paddles and a ball.</p>
        <p>The goal is to defeat your opponent by being the first one to gain 10 point.</p>
        <p>A player gets a point once the opponent misses a ball.</p>
      </div>
      <div class="card">
        <div class="flex justify-content-center flex-wrap card-container mt-4">
            <Button @click="playGame" label="Play Game"
                class="flex align-items-center justify-content-center border-round m-4" />
            <Button @click="watchGame" label="Watch Game"
                class="flex align-items-center justify-content-center border-round m-4" />
        </div>    
    </div>
    </div>
    <div v-else>
      <LogInButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import storeUser from "@/store";
import LogInButton from "@/components/LogInButton.vue";

import Button from "primevue/button";
import { useRouter } from "vue-router";

const router = useRouter();
const playGame = () => {
    router.push({
        name: "Game",
    })
}
const watchGame = () => {
    router.push({
        name: "Game",
    })
}

</script>
