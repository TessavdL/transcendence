<template>
    <Navbar />
    <div class="about">
        <h3>About PONG</h3>
        <p>Pong is one of the first computer games that ever created.</p>
        <p>The game was originally developed by Allan Alcorn and released in 1972 by Atari corporations. </p>
        <p>This simple "tennis like" game features two paddles and a ball.</p>
        <p>The goal is to defeat your opponent by being the first one to gain 10 point.</p>
        <p>A player gets a point once the opponent misses a ball.</p>
    </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { useRouter } from "vue-router";
import NavMenu from "@/components/NavMenu.vue";

</script>
