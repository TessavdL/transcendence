<template>
  <div>
    <h3 class="logout-msg">Please login with 42 authentication</h3>
    <a class="btn btn-info login-button" :href="getLink()">42 Intra Login</a>
  </div>
</template>

<script setup lang="ts">
import { HOST } from '@/constants/constants';

function getLink(): string {
  return `http://${HOST}:3001/auth/login`
}
</script>

<style scoped>
.logout-msg {
  font-size: 30px;
  color: #ffffff;
  margin: 30px auto;
}

.login-button {
  margin: 30px auto;
  font-size: 30px;
  border-radius: 10px;
}
</style>
