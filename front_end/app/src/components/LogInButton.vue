<template>
  <div>
    <h3 class="logout-msg">Please login with 42 authentication</h3>
    <a class="btn btn-info logout-button" href="http://localhost:3001/auth/login">42 Intra Login</a>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.logout-msg{
  font-size: 30px;
  color: #ffffff;
  margin: 30px auto;
}
.logout-button {
  margin: 30px auto;
  font-size: 30px;
}
</style>
