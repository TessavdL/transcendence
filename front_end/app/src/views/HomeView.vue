<template>
  <div class="home">
    <!-- <Navbar /> -->
    <div v-if="storeUser.state.isAuthenticated" />
    <div v-else>
      <LogInButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import storeUser from "@/store";
import LogInButton from "@/components/LogInButton.vue";
import NavMenu from "@/components/NavMenu.vue";
</script>
